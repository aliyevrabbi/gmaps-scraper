from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from backend.main import CreateJobPayload, Job, scrape_job


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the LeadZen Google Maps scraper")
    parser.add_argument("--query", required=True)
    parser.add_argument("--location", default="")
    parser.add_argument("--target-count", type=int, default=20)
    args = parser.parse_args()

    payload = CreateJobPayload(
        query=args.query,
        location=args.location,
        targetCount=max(1, min(args.target_count, 100)),
        filename="leadzen-leads.xlsx",
    )
    job = Job(job_id="github-actions", payload=payload)
    asyncio.run(scrape_job(job))

    output = Path("results")
    output.mkdir(parents=True, exist_ok=True)
    (output / "results.json").write_text(
        json.dumps(job.results, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    if job.output_path and job.output_path.exists():
        (output / "leadzen-leads.xlsx").write_bytes(job.output_path.read_bytes())

    print(json.dumps({
        "status": job.status,
        "message": job.message,
        "inspected": job.inspected,
        "skipped": job.skipped,
        "found": job.found,
        "errors": job.errors,
        "files": [str(p) for p in sorted(output.glob("*"))],
    }, ensure_ascii=False))

    if job.status == "error":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
