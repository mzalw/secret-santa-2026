import streamlit as st
import random
import urllib.parse
from typing import Dict, List, Optional
import pandas as pd
import json
import os

# ==============================================================================
# 1. KONFIGURACJA STRONY I STYLE DLA SENIORÓW (WYSOKI KONTRAST, DUŻA CZCIONKA)
# ==============================================================================
st.set_page_config(
    page_title="Losowanie prezentów u Zalewskich 2026",
    page_icon="🎅",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Wstrzyknięcie stylów CSS zapewniających powiększoną czcionkę, wysoki kontrast i wygodne przyciski
st.markdown("""
<style>
    /* Globalne powiększenie czcionki dla wygody seniorów i osób starszych */
    html, body, [class*="css"] {
        font-size: 19px !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    /* Wyraziste nagłówki o wysokim kontraście */
    h1 {
        font-size: 2.3rem !important;
        font-weight: 800 !important;
        color: #991b1b !important;
        margin-bottom: 0.2rem !important;
    }
    h2 {
        font-size: 1.75rem !important;
        font-weight: 700 !important;
        color: #0f172a !important;
    }
    h3 {
        font-size: 1.35rem !important;
        font-weight: 700 !important;
    }
    
    /* Duże, wyraźne przyciski dotykowe (min. 56px wysokości) */
    .stButton > button {
        min-height: 56px !important;
        font-size: 1.15rem !important;
        font-weight: 700 !important;
        border-radius: 14px !important;
        padding: 12px 24px !important;
        transition: all 0.2s ease !important;
        border: 2px solid transparent !important;
    }
    
    /* Główne przyciski w świątecznej czerwieni */
    .stButton > button[kind="primary"] {
        background-color: #b91c1c !important;
        color: #ffffff !important;
        border-color: #991b1b !important;
    }
    .stButton > button[kind="primary"]:hover {
        background-color: #991b1b !important;
        transform: translateY(-1px);
    }
    
    /* Pola formularzy - powiększone i wyraźnie obramowane */
    .stSelectbox, .stTextInput, .stNumberInput {
        font-size: 1.2rem !important;
    }
    input {
        font-size: 1.2rem !important;
        padding: 10px 14px !important;
    }

    /* Pasek stanu procesu */
    .stage-banner {
        background: #ffffff;
        border: 2px solid #e2e8f0;
        border-radius: 16px;
        padding: 18px 22px;
        margin-bottom: 24px;
        box-shadow: 0 3px 8px rgba(0,0,0,0.04);
    }
    .stage-badge {
        display: inline-block;
        padding: 7px 16px;
        border-radius: 30px;
        font-size: 1rem;
        font-weight: 800;
        margin-right: 10px;
    }
    .badge-active {
        background-color: #b91c1c;
        color: #ffffff;
    }
    .badge-done {
        background-color: #15803d;
        color: #ffffff;
    }
    .badge-locked {
        background-color: #cbd5e1;
        color: #475569;
    }
    
    /* Karta wylosowanej osoby w Etapie 2 */
    .gift-box {
        background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
        color: #ffffff;
        padding: 32px;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 12px 28px -5px rgba(185, 28, 28, 0.45);
        margin: 20px 0;
    }
    .gift-box h1 {
        color: #ffffff !important;
        font-size: 2.9rem !important;
        margin: 12px 0 !important;
    }

    /* Karta informacyjna */
    .info-card {
        background-color: #f8fafc;
        border: 2px solid #cbd5e1;
        border-radius: 16px;
        padding: 16px 20px;
        margin-bottom: 20px;
    }
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# 2. BAZA 6 STAŁYCH PAR RODZINNYCH (12 OSÓB)
# ==============================================================================
PARTICIPANTS = {
    # Para 1
    "Michał": {"partner": "Dominika", "pair": "Para 1", "pin": "1001"},
    "Dominika": {"partner": "Michał", "pair": "Para 1", "pin": "1002"},
    
    # Para 2
    "Rafał": {"partner": "Izabela", "pair": "Para 2", "pin": "2001"},
    "Izabela": {"partner": "Rafał", "pair": "Para 2", "pin": "2002"},
    
    # Para 3
    "Ula": {"partner": "Przemek", "pair": "Para 3", "pin": "3001"},
    "Przemek": {"partner": "Ula", "pair": "Para 3", "pin": "3002"},
    
    # Para 4: Stanisław i Janina (Seniorzy)
    "Stanisław": {"partner": "Janina", "pair": "Para 4 (Seniorzy)", "pin": "4001"},
    "Janina": {"partner": "Stanisław", "pair": "Para 4 (Seniorzy)", "pin": "4002"},
    
    # Para 5
    "Paweł": {"partner": "Dorota", "pair": "Para 5", "pin": "5001"},
    "Dorota": {"partner": "Paweł", "pair": "Para 5", "pin": "5002"},
    
    # Para 6
    "Joanna": {"partner": "Tomek", "pair": "Para 6", "pin": "6001"},
    "Tomek": {"partner": "Joanna", "pair": "Para 6", "pin": "6002"},
}

NAMES = list(PARTICIPANTS.keys())
TOTAL_MEMBERS = len(NAMES) # Dokładnie 12 osób
LOCAL_DB_FILE = "secret_santa_db.json"

# ==============================================================================
# 3. WARSTWA DANYCH (GOOGLE SHEETS LUB CHMURA / LOCAL JSON FALLBACK)
# ==============================================================================
def get_sheets_connection():
    """Próbuje zainicjalizować połączenie z Google Sheets zdefiniowane w st.secrets"""
    try:
        from streamlit_gsheets import GSheetsConnection
        conn = st.connection("gsheets", type=GSheetsConnection)
        return conn
    except Exception:
        return None

def load_data_from_storage() -> dict:
    """Wczytuje aktualny stan z Google Sheets lub trwałego pliku JSON"""
    conn = get_sheets_connection()
    if conn:
        try:
            df = conn.read(ttl="5s")
            if df is not None and not df.empty and "name" in df.columns:
                budget_votes = {}
                wishes = {}
                assignments = {}
                official_budget = 150
                for _, row in df.iterrows():
                    name = str(row.get("name", "")).strip()
                    if name in NAMES:
                        b = row.get("budget_vote")
                        if pd.notna(b) and str(b).strip() != "":
                            try:
                                budget_votes[name] = int(float(b))
                            except Exception:
                                pass
                        
                        w = row.get("wishes")
                        if pd.notna(w) and str(w).strip() != "":
                            w_list = [item.strip() for item in str(w).split(" | ") if item.strip()]
                            if w_list:
                                wishes[name] = w_list

                        r = row.get("receiver")
                        if pd.notna(r) and str(r).strip() in NAMES:
                            assignments[name] = str(r).strip()

                    ob = row.get("official_budget")
                    if pd.notna(ob) and str(ob).strip() != "":
                        try:
                            official_budget = int(float(ob))
                        except Exception:
                            pass

                return {
                    "budget_votes": budget_votes,
                    "wishes": wishes,
                    "assignments": assignments,
                    "official_budget": official_budget
                }
        except Exception:
            pass

    # Fallback lokalny
    if os.path.exists(LOCAL_DB_FILE):
        try:
            with open(LOCAL_DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    return {
        "budget_votes": {},
        "wishes": {},
        "assignments": {},
        "official_budget": 150
    }

def save_data_to_storage(data: dict):
    """Zapisuje kompletny stan do pliku JSON oraz synchronizuje z Google Sheets"""
    try:
        with open(LOCAL_DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception:
        pass

    conn = get_sheets_connection()
    if conn:
        try:
            rows = []
            for name in NAMES:
                rows.append({
                    "name": name,
                    "pair": PARTICIPANTS[name]["pair"],
                    "budget_vote": data.get("budget_votes", {}).get(name, ""),
                    "wishes": " | ".join(data.get("wishes", {}).get(name, [])),
                    "receiver": data.get("assignments", {}).get(name, ""),
                    "official_budget": data.get("official_budget", 150)
                })
            df = pd.DataFrame(rows)
            conn.write(df)
        except Exception:
            pass

# Inicjalizacja stanu w sesji
persisted_data = load_data_from_storage()
if "budget_votes" not in st.session_state:
    st.session_state.budget_votes = persisted_data.get("budget_votes", {})
if "wishes" not in st.session_state:
    st.session_state.wishes = persisted_data.get("wishes", {})
if "assignments" not in st.session_state:
    st.session_state.assignments = persisted_data.get("assignments", {})
if "official_budget" not in st.session_state:
    st.session_state.official_budget = persisted_data.get("official_budget", 150)

# ==============================================================================
# 4. MATEMATYCZNY ALGORYTM LOSOWANIA Z WYKLUCZENIAMI (BEZWZGLĘDNA BIJEKCJA)
# ==============================================================================
def run_secret_santa_draw(names: List[str]) -> Optional[Dict[str, str]]:
    """
    Losuje pary Secret Santa spełniając bezwzględne reguły:
    1. giver != receiver (brak losowania samego siebie)
    2. giver.partner != receiver (brak małżonka/partnera z pary)
    3. Każdy daje dokładnie 1 prezent i dostaje dokładnie 1 prezent
    4. Brak 2-osobowych cykli wzajemnych (A->B i B->A) jeśli istnieje rozwiązanie
    """
    givers = list(names)
    random.shuffle(givers)
    assignments = {}
    used_receivers = set()

    def solve(idx: int) -> bool:
        if idx == len(givers):
            return True
        giver = givers[idx]
        partner = PARTICIPANTS[giver]["partner"]

        candidates = [
            c for c in names
            if c not in used_receivers
            and c != giver
            and c != partner
            and (assignments.get(c) != giver if len(names) > 4 else True)
        ]
        random.shuffle(candidates)

        for cand in candidates:
            assignments[giver] = cand
            used_receivers.add(cand)
            if solve(idx + 1):
                return True
            del assignments[giver]
            used_receivers.remove(cand)

        return False

    if solve(0):
        return assignments

    # Fallback (gdyby 2-pętla była konieczna)
    assignments.clear()
    used_receivers.clear()

    def solve_relaxed(idx: int) -> bool:
        if idx == len(givers):
            return True
        giver = givers[idx]
        partner = PARTICIPANTS[giver]["partner"]
        candidates = [c for c in names if c not in used_receivers and c != giver and c != partner]
        random.shuffle(candidates)
        for c in candidates:
            assignments[giver] = c
            used_receivers.add(c)
            if solve_relaxed(idx + 1):
                return True
            del assignments[giver]
            used_receivers.remove(c)
        return False

    return assignments if solve_relaxed(0) else None

# ==============================================================================
# 5. OBLICZANIE STATUSU DWUETAPOWEGO PROCESU
# ==============================================================================
# Osoba ukończyła Etap 1, jeśli podała kwotę budżetu ORAZ wpisała min. 1 życzenie
completed_members = [
    name for name in NAMES
    if (name in st.session_state.budget_votes) and (len(st.session_state.wishes.get(name, [])) > 0)
]
completed_count = len(completed_members)
is_stage_1_complete = completed_count >= TOTAL_MEMBERS

# Czy losowanie zostało już przeprowadzone i zapisane
is_drawn = len(st.session_state.assignments) == TOTAL_MEMBERS

# Wyliczenie średniego budżetu ze wszystkich zebranych głosów
all_votes = list(st.session_state.budget_votes.values())
avg_budget = int(round(sum(all_votes) / len(all_votes))) if all_votes else 150

# Automatyczne przejście do Etapu 2:
# Gdy wszystkie 12 osób uzupełni dane, aplikacja zatwierdza średni budżet i losuje pary!
if is_stage_1_complete and not is_drawn:
    st.session_state.official_budget = avg_budget
    drawn_pairs = run_secret_santa_draw(NAMES)
    if drawn_pairs:
        st.session_state.assignments = drawn_pairs
        is_drawn = True
        save_data_to_storage({
            "budget_votes": st.session_state.budget_votes,
            "wishes": st.session_state.wishes,
            "assignments": st.session_state.assignments,
            "official_budget": st.session_state.official_budget
        })

current_stage = 2 if (is_stage_1_complete and is_drawn) else 1

# ==============================================================================
# 6. GŁÓWNY INTERFEJS STREAMLIT DLA RODZINY
# ==============================================================================

st.markdown("<h1>🎅 Losowanie prezentów u Zalewskich 2026</h1>", unsafe_allow_html=True)

# Pasek stanu 2 etapów
b1_class = "badge-done" if current_stage == 2 else "badge-active"
b2_class = "badge-done" if (current_stage == 2 and is_drawn) else "badge-locked"

st.markdown(f"""
<div class="stage-banner">
    <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
        <span class="stage-badge {b1_class}">Krok 1: Budżet i Lista Życzeń ({completed_count}/{TOTAL_MEMBERS} osób)</span>
        <span style="color:#94a3b8; font-weight:bold; font-size:1.3rem;">&rarr;</span>
        <span class="stage-badge {b2_class}">Krok 2: Losowanie i Tajny Podgląd</span>
    </div>
</div>
""", unsafe_allow_html=True)

# ------------------------------------------------------------------------------
# ETAP 1: PODANIE BUDŻETU ORAZ WPISANIE LISTY ŻYCZEŃ (W JEDNYM WIDOKU)
# ------------------------------------------------------------------------------
if current_stage == 1:
    st.markdown("<h2>📝 Krok 1: Podaj swój budżet oraz wpisz listę życzeń</h2>", unsafe_allow_html=True)
    st.info(f"📊 **Stan zaawansowania: Wypełniło {completed_count} z {TOTAL_MEMBERS} osób.** Każdy uczestnik podaje swoją propozycję kwoty oraz 2-3 pomysły na prezenty dla siebie. Gdy wszyscy uzupełnią formularz, aplikacja automatycznie przeprowadzi losowanie!")

    # Formularz logowania i zapisu danych
    col_user, col_form = st.columns([1, 1])

    with col_user:
        st.markdown("### 👤 Kto teraz uzupełnia?")
        selected_person = st.selectbox("Wybierz swoje imię z listy:", options=NAMES, key="s1_person_select")
        user_pin = st.text_input("Wpisz swój 4-cyfrowy kod PIN:", type="password", max_chars=6, key="s1_pin_input", placeholder="np. 1001")
        
        with st.expander("💡 Zapomniałeś PIN-u? Kliknij tutaj"):
            st.info(f"Domyślny kod PIN dla osoby **{selected_person}** to: **{PARTICIPANTS[selected_person]['pin']}**")

        st.markdown("""
        <div class="info-card">
            <strong>Wskazówki dla seniorów:</strong><br>
            Wpisz kwotę, jaką uważasz za odpowiednią, oraz 2-3 pomysły (np. ciepły szalik, dobra herbata, książka). Osoba, która Cię wylosuje, zobaczy Twoje podpowiedzi!
        </div>
        """, unsafe_allow_html=True)

    with col_form:
        st.markdown("### 💰 1. Twoja propozycja budżetu (zł):")
        current_v = st.session_state.budget_votes.get(selected_person, 150)
        
        # Szybkie kafelki gotowych kwot dla wygody
        c1, c2, c3, c4 = st.columns(4)
        for i, val in enumerate([50, 100, 150, 200]):
            with [c1, c2, c3, c4][i]:
                if st.button(f"{val} zł", key=f"quick_amt_{val}", use_container_width=True):
                    current_v = val

        budget_val = st.number_input("Lub wpisz dowolną kwotę (zł):", min_value=20, max_value=1000, value=current_v, step=10, key="budget_number_in")

        st.markdown("### 🎁 2. Twoje 2-3 pomysły na prezent świąteczny:")
        existing_wishes = st.session_state.wishes.get(selected_person, ["", "", ""])
        while len(existing_wishes) < 3:
            existing_wishes.append("")

        w1 = st.text_input("Pomysł 1:", value=existing_wishes[0], key="w1_input", placeholder="np. Ciepły wełniany szal lub czapka")
        w2 = st.text_input("Pomysł 2:", value=existing_wishes[1], key="w2_input", placeholder="np. Dobra kawa ziarnista lub zestaw herbat")
        w3 = st.text_input("Pomysł 3:", value=existing_wishes[2], key="w3_input", placeholder="np. Książka (kryminał / reportaż)")

        if st.button("💾 ZAPISZ MÓJ BUDŻET I LISTĘ ŻYCZEŃ", type="primary", use_container_width=True):
            if user_pin.strip() == PARTICIPANTS[selected_person]["pin"]:
                clean_wishes = [w.strip() for w in [w1, w2, w3] if w.strip()]
                if not clean_wishes:
                    st.warning("⚠️ Prosimy o wpisanie chociaż 1 pomysłu na prezent!")
                else:
                    # Zapisanie budżetu i życzeń
                    st.session_state.budget_votes[selected_person] = int(budget_val)
                    st.session_state.wishes[selected_person] = clean_wishes

                    save_data_to_storage({
                        "budget_votes": st.session_state.budget_votes,
                        "wishes": st.session_state.wishes,
                        "assignments": st.session_state.assignments,
                        "official_budget": st.session_state.official_budget
                    })
                    st.success(f"🎉 Sukces! Dane dla osoby {selected_person} zostały zapisane!")
                    st.rerun()
            else:
                st.error("❌ Błędny kod PIN! Sprawdź podpowiedź pod polem z PIN-em.")

    # Tabela postępu - kto już uzupełnił dane
    st.markdown("---")
    st.markdown("### 📋 Stan uzupełnienia formularza w rodzinie:")
    status_cols = st.columns(4)
    for idx, name in enumerate(NAMES):
        has_b = name in st.session_state.budget_votes
        has_w = len(st.session_state.wishes.get(name, [])) > 0
        is_ready = has_b and has_w

        with status_cols[idx % 4]:
            if is_ready:
                st.success(f"✅ **{name}** (Gotowe)")
            else:
                st.warning(f"⏳ **{name}** (Czeka)")

    # Opcja dla organizatora / administratora
    with st.expander("⚙️ Opcje organizatora (awaryjne przejście do losowania)"):
        st.write(f"Bieżąca średnia z podanych kwot: **{avg_budget} zł**")
        st.write(f"Liczba osób, które uzupełniły: **{completed_count} z {TOTAL_MEMBERS}**")
        if st.button("Zatwierdź bieżący stan i przeprowadź losowanie teraz"):
            st.session_state.official_budget = avg_budget
            # Uzupełnienie brakujących domyślnymi kwotami
            for n in NAMES:
                if n not in st.session_state.budget_votes:
                    st.session_state.budget_votes[n] = avg_budget
                if len(st.session_state.wishes.get(n, [])) == 0:
                    st.session_state.wishes[n] = ["Niespodzianka świąteczna!"]
            drawn = run_secret_santa_draw(NAMES)
            if drawn:
                st.session_state.assignments = drawn
                save_data_to_storage({
                    "budget_votes": st.session_state.budget_votes,
                    "wishes": st.session_state.wishes,
                    "assignments": st.session_state.assignments,
                    "official_budget": st.session_state.official_budget
                })
                st.rerun()

# ------------------------------------------------------------------------------
# ETAP 2: LOSOWANIE I TAJNY PODGLĄD WYNIKÓW
# ------------------------------------------------------------------------------
elif current_stage == 2:
    st.markdown("<h2>🎁 Krok 2: Sprawdź swój los (Tajny Podgląd)</h2>", unsafe_allow_html=True)
    st.success(f"🎉 **Wszystkie 12 osób uzupełniło dane!** Losowanie odbyło się z zachowaniem wykluczeń małżonków. Ustalony wspólny budżet: **{st.session_state.official_budget} zł**.")

    col_view1, col_view2 = st.columns([1, 1])

    with col_view1:
        st.markdown("### 👤 Kto chce sprawdzić swój wynik?")
        reveal_user = st.selectbox("Wybierz swoje imię:", options=NAMES, key="s2_reveal_user")
        reveal_pin = st.text_input("Wpisz swój 4-cyfrowy kod PIN:", type="password", max_chars=6, key="s2_reveal_pin", placeholder="np. 1001")
        
        with st.expander("💡 Przypomnij mój kod PIN"):
            st.info(f"Domyślny PIN dla **{reveal_user}**: `{PARTICIPANTS[reveal_user]['pin']}`")

    with col_view2:
        st.markdown("### 🔒 Weryfikacja tożsamości:")
        if not reveal_pin:
            st.info("👈 Wpisz swój kod PIN po lewej stronie, aby bezpiecznie odsłonić wylosowaną osobę.")
        elif reveal_pin.strip() != PARTICIPANTS[reveal_user]["pin"]:
            st.error("❌ Błędny kod PIN! Spróbuj ponownie lub skorzystaj z przypomnienia.")
        else:
            receiver = st.session_state.assignments.get(reveal_user)
            if receiver:
                st.success("✅ Kod PIN poprawny! Oto Twój wynik:")

                # Piękna, wyraźna karta świąteczna
                st.markdown(f"""
                <div class="gift-box">
                    <div style="font-size: 1.2rem; text-transform: uppercase; letter-spacing: 2px;">W tym roku robisz prezent dla:</div>
                    <h1>🎁 {receiver} 🎁</h1>
                    <div style="font-size: 1.15rem; opacity: 0.95;">
                        ({PARTICIPANTS[receiver]['pair']} · Małżonek/Partner: {PARTICIPANTS[receiver]['partner']})
                    </div>
                </div>
                """, unsafe_allow_html=True)

                st.markdown(f"### 💰 Ustalony wspólny limit budżetu: **{st.session_state.official_budget} zł**")

                # Lista życzeń wylosowanej osoby
                receiver_wishes = st.session_state.wishes.get(receiver, [])
                st.markdown(f"### 📝 Pomysły na prezent od {receiver}:")
                if receiver_wishes:
                    for i, w in enumerate(receiver_wishes, 1):
                        st.markdown(f"**{i}.** {w}")
                else:
                    st.info(f"{receiver} nie wpisał(a) jeszcze konkretnych życzeń.")

                # Przygotowanie wiadomości na WhatsApp i SMS
                wishes_formatted = "\\n".join([f"{i+1}. {w}" for i, w in enumerate(receiver_wishes)])
                sms_text = (
                    f"🎁 Cześć {reveal_user}! W losowaniu prezentów u Zalewskich 2026 wylosowałeś(aś): {receiver}! "
                    f"Budżet: {st.session_state.official_budget} zł. "
                    f"Pomysły na prezent: {wishes_formatted}. Wesołych Świąt!"
                )
                wa_link = f"https://wa.me/?text={urllib.parse.quote(sms_text)}"
                sms_link = f"sms:?&body={urllib.parse.quote(sms_text)}"

                st.markdown("---")
                st.markdown("#### Zapisz sobie na telefonie:")
                btn_wa, btn_sms = st.columns(2)
                with btn_wa:
                    st.link_button("💬 Otwórz w WhatsApp", wa_link, use_container_width=True)
                with btn_sms:
                    st.link_button("📱 Wyślij jako SMS", sms_link, use_container_width=True)

                st.markdown("---")
                st.warning("🔒 **Ważne dla dyskrecji:** Po sprawdzeniu wyniku skasuj wpisany PIN z pola po lewej stronie, aby kolejna osoba podchodząca do telefonu nie zobaczyła Twojego losu!")

    # Panel organizatora
    st.markdown("---")
    with st.expander("📋 Panel Organizatora (Podgląd wszystkich par i eksport)"):
        st.warning("⚠️ Ta tabela zawiera pełną listę wszystkich 12 wylosowanych par. Oglądaj tylko jako administrator!")
        show_admin_tbl = st.checkbox("Pokaż pełną tabelę wyników", value=False)
        if show_admin_tbl:
            rows = []
            for giver in NAMES:
                rec = st.session_state.assignments.get(giver, "—")
                rec_w = ", ".join(st.session_state.wishes.get(rec, []))
                rows.append({
                    "Dający prezent": giver,
                    "Para": PARTICIPANTS[giver]["pair"],
                    "PIN": PARTICIPANTS[giver]["pin"],
                    "Wylosowany obdarowywany": rec,
                    "Życzenia obdarowywanego": rec_w,
                })
            df_res = pd.DataFrame(rows)
            st.dataframe(df_res, use_container_width=True)

            csv_data = df_res.to_csv(index=False).encode('utf-8')
            st.download_button(
                "📥 Pobierz wyniki jako CSV / Excel",
                data=csv_data,
                file_name="secret_santa_wyniki_rodzina.csv",
                mime="text/csv"
            )
