#!/usr/bin/env python3
"""
GMapsScraper TUI — Terminal User Interface
Rich-based live terminal GUI for the Google Maps scraper
"""

import sys, os, threading, queue, time, asyncio, traceback, argparse, atexit
from dataclasses import dataclass, field

# ── Rich imports ──────────────────────────────────────
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.live import Live
from rich.text import Text
from rich.align import Align
from rich import box
from rich.prompt import Prompt, IntPrompt, Confirm
from rich.style import Style

# ── Import scraper ────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scraper import scrape_google_maps

console = Console()

# ── Keep window open on crash ─────────────────────────
_CRASHED = True   # default True — only set False on clean exit

def _crash_guard():
    """atexit handler — if we crashed, keep the terminal window open."""
    if _CRASHED:
        try:
            console.print()
            console.print("[bold yellow]⚠  Proqram gözlənilməz xəta ilə bağlandı.[/bold yellow]")
            console.print("[dim]Hər hansı düyməyə basın...[/dim]")
            input()
        except Exception:
            pass

atexit.register(_crash_guard)


# ── Banner ────────────────────────────────────────────
BANNER = r"""
  ╔═╗╔╦╗╔═╗╔═╗╔═╗   ╔═╗╔═╗╦═╗╔═╗╔═╗╔═╗╦═╗
  ║ ╦║║║╠═╣╚═╗╚═╗   ╚═╗║  ╠╦╝╠═╣╠═╝║╣ ╠╦╝
  ╚═╝╩ ╩╩ ╩╚═╝╚═╝   ╚═╝╚═╝╩╚═╩ ╩╩  ╚═╝╩╚═
"""

SUB = "Google Maps • Vebsaytı Olmayan Biznes Lead Generator"

# ── Colors (inline markup) ────────────────────────────
H = "#00d4ff"      # header blue
A = "#7cff6b"      # accent green
W = "#ff9f43"      # warn orange
D = "#ff6b6b"      # danger red
M = "#8395a7"      # muted grey
B = "#ffffff"      # white bold
G = "#feca57"      # gold


def c(color, text):
    """Return [color]text[/color] markup snippet."""
    return f"[{color}]{text}[/{color}]"


def cbold(color, text):
    return f"[bold {color}]{text}[/bold {color}]"


# ── Pre-flight checks ─────────────────────────────────
def check_requirements():
    """Verify all dependencies are available. Returns (ok, message)."""
    issues = []

    # Check playwright
    try:
        import playwright
    except ImportError:
        issues.append("playwright  —  pip install playwright")

    # Check if chromium is installed for playwright
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            pass
    except Exception as e:
        err = str(e).lower()
        if "executable doesn't exist" in err or "chromium" in err:
            issues.append("Chromium brauzeri  —  playwright install chromium")
        elif "playwright" in err:
            issues.append("playwright quraşdırılmayıb  —  pip install playwright")

    # Check openpyxl
    try:
        import openpyxl
    except ImportError:
        issues.append("openpyxl  —  pip install openpyxl")

    # Check rich
    try:
        import rich
    except ImportError:
        issues.append("rich  —  pip install rich")

    if issues:
        return False, "\n".join(f"  ✕  {i}" for i in issues)
    return True, ""


# ── State ─────────────────────────────────────────────
@dataclass
class ScraperState:
    results: list = field(default_factory=list)
    target: int = 0
    inspected: int = 0
    skipped: int = 0
    error_count: int = 0
    status: str = "Hazırlanır..."
    done: bool = False
    error: str = ""
    filename: str = ""


state = ScraperState()
result_queue: queue.Queue = queue.Queue()


# ── Helpers ───────────────────────────────────────────
def progress_bar(current: int, total: int, width: int = 30) -> str:
    if total == 0:
        return c(M, "░" * width)
    pct = min(current / total, 1.0)
    filled = int(pct * width)
    bar = "█" * filled + "░" * (width - filled)
    return f"{c(G, bar)} {pct*100:.0f}%"


def truncate(s: str, max_len: int = 28) -> str:
    if not s:
        return ""
    s = str(s)
    return s[:max_len - 3] + "..." if len(s) > max_len else s


# ── Render function for Live display ──────────────────
def render_scraping() -> Panel:
    """Build the live scraping panel."""

    bar = progress_bar(len(state.results), state.target)

    stats_parts = [
        f"{cbold(A, 'Tapıldı:')} {len(state.results)}/{state.target}",
        f"{c(M, 'Baxıldı:')} {state.inspected}",
        f"{c(W, 'Saytı var:')} {state.skipped}",
    ]
    if state.error_count > 0:
        stats_parts.append(f"{c(D, 'Xəta:')} {state.error_count}")

    stats_line = "  │  ".join(stats_parts)

    # ── Results table ──
    table = Table(
        box=box.ROUNDED,
        show_header=True,
        header_style=Style(color=H, bold=True),
        border_style=Style(color=M),
        pad_edge=False,
        expand=True,
    )
    table.add_column("#", width=3, style=Style(color=M), justify="right")
    table.add_column("Biznes Adı", width=24, style=Style(color=B, bold=True))
    table.add_column("★", width=4, style=Style(color=G, bold=True), justify="center")
    table.add_column("Rəy", width=5, style=Style(color=M), justify="center")
    table.add_column("Instagram", width=24, style=Style(color=A))
    table.add_column("Ünvan", width=22, style=Style(color=M))

    for i, r in enumerate(state.results[-20:], 1):
        table.add_row(
            str(i),
            truncate(r.get("Business Name", ""), 23),
            str(r.get("Rating", "")),
            str(r.get("Reviews Count", "")),
            truncate(r.get("Instagram", ""), 23),
            truncate(r.get("Address", ""), 21),
        )

    if not state.results:
        table.add_row("", "[dim]Gözləyin...[/dim]", "", "", "", "")

    # ── Status ──
    if state.done:
        if state.error:
            status_text = f"{c(D, '✕')} {state.status}"
        else:
            status_text = f"{c(A, '✓')} {state.status}"
    else:
        status_text = f"{c(G, '⏳')} {state.status}"

    # ── Assemble ──
    inner = f"""
{bar}

{stats_line}

{status_text}
"""
    layout = Table.grid(padding=(0, 2))
    layout.add_row(Text.from_markup(inner))
    layout.add_row(table)

    return Panel(
        layout,
        title=f"{c(H, 'GMapsScraper TUI')}  by Rabbi Aliyev",
        border_style=Style(color=H),
        box=box.HEAVY,
        padding=(1, 2),
    )


# ── Background scraper thread ─────────────────────────
def scraper_thread(query: str, target: int, filename: str, headless: bool = False):
    """Run the scraper in a background thread, pushing events to queue."""

    def callback(event_type, data):
        result_queue.put((event_type, data))

    async def run():
        await scrape_google_maps(
            query, target, filename,
            progress_callback=callback,
            headless=headless,
        )

    try:
        asyncio.run(run())
    except Exception as e:
        tb = traceback.format_exc()
        result_queue.put(("error", f"{e}\n{tb}"))


# ── Live scraping loop ────────────────────────────────
def run_live_scraping(query: str, target: int, filename: str, headless: bool = False):
    """Run scraper with live Rich display."""

    state.target = target
    state.status = f"Google Maps-də '{query}' axtarılır..."

    # Start scraper in background thread
    thread = threading.Thread(
        target=scraper_thread,
        args=(query, target, filename, headless),
        daemon=True,
    )
    thread.start()

    try:
        with Live(render_scraping(), console=console, refresh_per_second=10, screen=True) as live:
            while not state.done:
                # Drain event queue
                try:
                    while True:
                        event_type, data = result_queue.get_nowait()

                        if event_type == "inspect":
                            state.inspected += 1
                            state.status = "Mağaza yoxlanılır..."
                        elif event_type == "skip":
                            state.skipped += 1
                        elif event_type == "result":
                            state.results.append(data)
                            name = data.get("Business Name", "???")
                            state.status = f"✓ Tapıldı: {name}"
                        elif event_type == "inspect_error":
                            state.error_count += 1
                        elif event_type == "scroll":
                            state.status = "Daha çox nəticə üçün sürüşdürülür..."
                        elif event_type == "log":
                            state.status = str(data)
                        elif event_type == "done":
                            state.done = True
                            state.filename = data.get("filename", filename)
                            state.status = f"Tamamlandı! {data.get('total', 0)} nəticə ✅"
                        elif event_type == "error":
                            state.done = True
                            state.error = str(data)
                            state.status = f"Xəta baş verdi"
                except queue.Empty:
                    pass

                live.update(render_scraping())
                time.sleep(0.08)

            # Final update
            live.update(render_scraping())
            time.sleep(1.0)
    finally:
        state.done = True

    thread.join(timeout=5)


# ── Banner screen ─────────────────────────────────────
def show_banner():
    console.clear()
    banner_text = Text(BANNER, style=Style(color=H, bold=True))
    banner_text.append("\n")
    banner_text.append(SUB, style=Style(color=M))

    panel = Panel(
        Align.center(banner_text),
        box=box.DOUBLE,
        border_style=Style(color=H),
        padding=(1, 4),
    )
    console.print(panel)
    console.print()


# ── Summary screen ────────────────────────────────────
def show_summary():
    console.clear()
    console.print()

    if state.error:
        panel = Panel(
            Align.center(Text(f"\nXəta: {state.error}\n", style=Style(color=D))),
            title="[bold red]XƏTA[/bold red]",
            border_style=Style(color=D),
            box=box.HEAVY,
        )
        console.print(panel)
        return

    total = len(state.results)
    summary_text = Text()
    summary_text.append(f"\n  ✅  Toplam nəticə:  ", style=Style(color=M))
    summary_text.append(f"{total}", style=Style(color=A, bold=True))
    summary_text.append(f"\n  🔍  Baxılan URL:    ", style=Style(color=M))
    summary_text.append(f"{state.inspected}", style=Style(color=B, bold=True))
    summary_text.append(f"\n  🚫  Saytı olan:     ", style=Style(color=M))
    summary_text.append(f"{state.skipped}", style=Style(color=W, bold=True))
    summary_text.append(f"\n  ❌  Xətalı:         ", style=Style(color=M))
    summary_text.append(f"{state.error_count}", style=Style(color=D, bold=True))
    summary_text.append(f"\n  💾  Fayl:           ", style=Style(color=M))
    summary_text.append(f"{state.filename}", style=Style(color=A, bold=True))
    summary_text.append("\n")

    panel = Panel(
        Align.center(summary_text),
        title=f"{c(A, 'NƏTİCƏ')}  {total} biznes tapıldı",
        border_style=Style(color=A),
        box=box.HEAVY,
        padding=(1, 3),
    )
    console.print(panel)

    # Final results table
    if state.results:
        console.print()
        table = Table(
            title=Text("📋 Tapılan Bizneslər", style=Style(color=H, bold=True)),
            box=box.ROUNDED,
            show_header=True,
            header_style=Style(color=H, bold=True),
            border_style=Style(color=M),
        )
        table.add_column("#", width=3, style=Style(color=M), justify="right")
        table.add_column("Biznes Adı", width=28, style=Style(color=B, bold=True))
        table.add_column("★", width=4, style=Style(color=G, bold=True), justify="center")
        table.add_column("Rəy", width=5, style=Style(color=M), justify="center")
        table.add_column("Instagram", width=30, style=Style(color=A))

        for i, r in enumerate(state.results, 1):
            table.add_row(
                str(i),
                truncate(r.get("Business Name", ""), 27),
                str(r.get("Rating", "")),
                str(r.get("Reviews Count", "")),
                truncate(r.get("Instagram", ""), 29),
            )

        console.print(table)

    console.print()


# ── Main TUI flow ─────────────────────────────────────
def main():
    global state, _CRASHED

    try:
        # ── Step 0: Pre-flight check ──
        ok, msg = check_requirements()
        if not ok:
            console.clear()
            console.print()
            console.print(Panel(
                Align.center(Text(
                    "\nAşağıdakı komponentlər çatışmır:\n\n"
                    f"{msg}\n\n"
                    "Zəhmət olmasa quraşdırıb təkrar başladın.\n",
                    style=Style(color=D),
                )),
                title="[bold red]⚠  TƏLƏBLƏR QARŞILANMIR[/bold red]",
                border_style=Style(color=D),
                box=box.HEAVY,
                padding=(1, 2),
            ))
            console.print()
            console.print("[dim]Hər hansı düyməyə basın...[/dim]")
            try:
                input()
            except Exception:
                pass
            sys.exit(1)

        # ── Step 1: Banner ──
        show_banner()

        # ── Step 2: Input form ──
        console.print(Panel(
            Text("Məlumatları daxil edin:", style=Style(color=B, bold=True)),
            box=box.ROUNDED,
            border_style=Style(color=H),
        ))
        console.print()

        # ── Bulletproof input: Rich Prompt first, fallback to raw input ──
        def safe_prompt(label, default, cast=str):
            """Try Rich Prompt; fall back to raw input() on any error."""
            try:
                if cast is int:
                    return IntPrompt.ask(label, default=default)
                else:
                    return Prompt.ask(label, default=str(default))
            except Exception:
                console.print(f"[dim](fallback input)[/dim]")
                console.print(label, end="")
                raw = input().strip()
                if not raw:
                    return default
                try:
                    return cast(raw)
                except Exception:
                    return default

        query = safe_prompt(f"  {c(H, '🔍')} Axtarış sorğusu", "baku dentists")
        target = safe_prompt(f"  {c(A, '🎯')} Hədəf sayı", 20, cast=int)
        filename = safe_prompt(f"  {c(G, '💾')} Excel fayl adı", "leads")

        console.print()

        try:
            doit = Confirm.ask(f"  {c(B, '▶')} Başlansın?", default=True)
        except Exception:
            console.print(f"  {c(B, '▶')} Başlansın? (Y/n): ", end="")
            ans = input().strip().lower()
            doit = ans in ("", "y", "yes", "b", "beli", "h", "he")

        if not doit:
            console.print(f"\n  {c(M, '✕')} İmtina edildi. Çıxış...\n")
            return

        # ── Step 3: Live scraping ──
        console.clear()

        # Reset state for fresh run
        state = ScraperState()
        while not result_queue.empty():
            result_queue.get_nowait()

        run_live_scraping(query, target, filename)

        # ── Step 4: Summary ──
        show_summary()

        # ── Step 5: Run again? ──
        console.print()
        if Confirm.ask(f"  {c(B, '🔄')} Yenidən başlansın?", default=False):
            main()
        else:
            console.print(f"\n  {c(M, '👋')} Çıxış edilir... Sağol!\n")

    except KeyboardInterrupt:
        _CRASHED = False  # clean exit
        console.print(f"\n\n  {c(W, '⚠')} İstifadəçi tərəfindən dayandırıldı.\n")
        sys.exit(0)
    except EOFError:
        _CRASHED = False  # clean exit
        console.print(f"\n\n  {c(M, '👋')} Çıxış edilir...\n")
        sys.exit(0)
    except Exception as e:
        _CRASHED = True
        console.print()
        console.print(Panel(
            Text(f"\nGözlənilməz xəta:\n\n{e}\n\n{traceback.format_exc()}\n", style=Style(color=D)),
            title="[bold red]XƏTA[/bold red]",
            border_style=Style(color=D),
            box=box.HEAVY,
        ))
        console.print(f"\n  {c(M, 'Hər hansı düyməyə basın...')}")
        try:
            input()
        except Exception:
            pass
        sys.exit(1)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        # Top-level catch (e.g. import errors, missing deps before Rich even loads)
        _CRASHED = True
        try:
            console.print()
            console.print(Panel(
                Text(f"\nBaşlanğıc xətası:\n\n{e}\n\n{traceback.format_exc()}\n", style=Style(color=D)),
                title="[bold red]KRİTİK XƏTA[/bold red]",
                border_style=Style(color=D),
                box=box.HEAVY,
            ))
            console.print("[dim]Hər hansı düyməyə basın...[/dim]")
            input()
        except Exception:
            pass
        sys.exit(1)
