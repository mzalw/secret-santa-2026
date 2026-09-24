# Świąteczny Secret Santa - Wdrożenie na Streamlit Community Cloud

Aplikacja w Pythonie (`main.py`) jest w 100% gotowa do darmowego wdrożenia online na [Streamlit Community Cloud](https://share.streamlit.io/).

---

## 🚀 Jak uruchomić lokalnie (Python):

1. Zainstaluj zależności:
   ```bash
   pip install -r requirements.txt
   ```
2. Uruchom aplikację:
   ```bash
   streamlit run main.py
   ```
3. Aplikacja otworzy się automatycznie w Twojej przeglądarce pod adresem `http://localhost:8501`.

---

## ☁️ Jak wdrożyć za darmo na Streamlit Community Cloud:

1. Utwórz nowe repozytorium na [GitHub](https://github.com/) (np. `secret-santa-rodzina`).
2. Wrzuć do niego pliki:
   - `main.py`
   - `requirements.txt`
   - `.streamlit/config.toml`
3. Wejdź na [share.streamlit.io](https://share.streamlit.io/) i zaloguj się swoim kontem GitHub.
4. Kliknij **"New app"**, wybierz swoje repozytorium oraz plik `main.py`.
5. Kliknij **"Deploy!"** — po 1-2 minutach otrzymasz stały link dla całej rodziny!

---

## 📊 Konfiguracja trwałej bazy w Google Sheets (opcjonalnie):

Aplikacja domyślnie działa w pamięci sesji Streamlit. Aby dane (budżet, losowania, życzenia) były trwale zapisywane w Google Sheets:

1. Stwórz pusty arkusz w Google Sheets (np. o nazwie `Secret Santa Rodzina`).
2. Nadaj mu uprawnienia edycji dla każdego, kto ma link (lub dodaj e-mail swojego konta serwisowego Google Cloud).
3. W panelu Twojej aplikacji na Streamlit Cloud wejdź w **Settings** -> **Secrets**.
4. Wklej:
   ```toml
   [connections.gsheets]
   spreadsheet = "https://docs.google.com/spreadsheets/d/TWÓJ_IDENTYFIKATOR_ARKUSZA/edit"
   ```
5. Kliknij **Save**. Aplikacja będzie od teraz automatycznie synchronizować wyniki z Twoim arkuszem Google!
