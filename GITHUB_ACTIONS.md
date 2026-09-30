# Telefonda pulsuz scraper istifadəsi

Bu versiyada hostinq və kart lazım deyil. Scraper GitHub-un pulsuz Actions serverində işləyir.

## Telefonda işə salmaq

1. [gmaps-scraper repository-sini açın](https://github.com/aliyevrabbi/gmaps-scraper).
2. **Actions** bölməsinə keçin.
3. Soldan **LeadZen Scrape** seçin.
4. **Run workflow** düyməsinə basın.
5. Aşağıdakı sahələri doldurun:
   - **Açar söz:** məsələn `restoran`
   - **Lokasiya:** məsələn `Bakı`
   - **Nəticə sayı:** məsələn `20`
6. **Run workflow** düyməsinə basın.
7. İşin üstünə daxil olub tamamlanmasını gözləyin.
8. Tamamlandıqdan sonra səhifənin aşağısındakı **Artifacts** hissəsində `leadzen-results-...` faylını endirin.
9. ZIP-i açın; içində `leadzen-leads.xlsx` və `results.json` olacaq.

## Nəyi süzür?

Scraper Google Maps biznes səhifəsində website yerinə Instagram linki olan biznesləri seçir və bunları Excel-ə yazır:

- Biznes adı
- Reytinq
- Rəy sayı
- Telefon
- Instagram linki
- Ünvan
- Google Maps linki

## Mühüm qeyd

GitHub Actions işləri pulsuz olsa da, Google Maps-in dəyişən səhifə quruluşu, internet/rate limitləri və GitHub Actions vaxt limitləri nəticəyə təsir edə bilər. Ən doğru nəticə üçün əvvəlcə 5-10 nəticə ilə test edin, sonra sayı artırın.
