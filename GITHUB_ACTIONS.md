
## Run workflow düyməsi görünmürsə — ən asan üsul

`config/search.json` faylını açın:

1. Repository-də `config/search.json` faylına daxil olun.
2. Sağ yuxarıdakı qələm işarəsinə (**Edit this file**) basın.
3. Yalnız bu 3 dəyəri dəyişin:

```json
{
  "query": "restoran",
  "location": "Bakı",
  "target_count": 20
}
```

4. Aşağıya keçin və **Commit changes** düyməsinə basın.
5. GitHub həmin dəyişiklikdən sonra scraperi avtomatik başladacaq.
6. **Actions** bölməsindən işləyən işi açın.
7. İş tamamlananda **Artifacts** hissəsindən Excel ZIP faylını endirin.

Bu üsulda `scrape.yml` faylını dəyişməyin. Hər yeni axtarış üçün yalnız `config/search.json` faylını redaktə edin və **Commit changes** edin.
