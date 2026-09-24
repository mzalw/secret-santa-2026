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
    page_title="Świąteczny Secret Santa dla Rodziny",
    page_icon="🎅",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Stylizacja: duża czytelna czcionka, wysoki kontrast, duże przyciski dotykowe
st.markdown("""
<style>
    /* Globalne powiększenie czcionki dla wygody seniorów */
    html, body, [class*="css"] {
        font-size: 19px !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    /* Wyraziste nagłówki */
    h1 {
        font-size: 2.3rem !important;
        font-weight: 800 !important;
        color: #991b1b !important;
        margin-bottom: 0.2rem !important;
    }
    h2 {
        font-size: 1.7rem !important;
        font-weight: 700 !important;
        color: #0f172a !important;
    }
    h3 {
        font-size: 1.35rem !important;
        font-weight: 700 !important;
    }
    
    /* Duże przyciski dotykowe (min. 56px wysokości) */
    .stButton > button {
        min-height: 56px !important;
        font-size: 1.15rem !important;
        font-weight: 700 !important;
        border-radius: 14px !important;
        padding: 12px 24px !important;
        transition: all 0.2s ease !important;
        border: 2px solid transparent !important;
    }
    
    /* Główne przyciski w świątecznym kolorze */
    .stButton > button[kind="primary"] {
        background-color: #b91c1c !important;
        color: #ffffff !important;
        border-color: #991b1b !important;
    }
    .stButton > button[kind="primary"]:hover {
        background-color: #991b1b !important;
        transform: translateY(-1px);
    }
    
    /* Duże pola formularzy */
    .stSelectbox, .stTextInput, .stNumberInput {
        font-size: 1.2rem !important;
    }
    input {
        font-size: 1.2rem !important;
        padding: 10px 14px !important;
    }

    /* Paski postępu etapów */
    .step-banner {
        background: #ffffff;
        border: 2px solid #e2e8f0;
        border-radius: 16px;
        padding: 16px 20px;
        margin-bottom: 24px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    }
    .step-badge {
        display: inline-block;
        padding: 6px 14px;
        border-radius: 30px;
        font-size: 0.95rem;
        font-weight: 800;
        margin-right: 8px;
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
    
    /* Karta z wylosowaną osobą */
    .gift-box {
        background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
        color: #ffffff;
        padding: 30px;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 10px 25px -5px rgba(185, 28, 28, 0.4);
        margin: 20px 0;
    }
    .gift-box h1 {
        color: #ffffff !important;
        font-size: 2.8rem !important;
        margin: 10px 0 !important;
    }
</style>
""", unsafe_allow_html=True)

# ==============================================================================
# 2. DEFINICJA 6 STAŁYCH PAR RODZINNYCH (12 OSÓB)
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
TOTAL_MEMBERS = len(NAMES) # 12 osób
LOCAL_DB_FILE = "secret_santa_db.json"

# ==============================================================================
# 3. WARSTWA DANYCH (GOOGLE SHEETS LUB ZAPIS PLIKOWY JSON W CHMURZE)
# ==============================================================================
def get_sheets_connection():
    """Inicjalizuje połączenie z Google Sheets jeśli skonfigurowane w secrets"""
    try:
        from streamlit_gsheets import GSheetsConnection
        conn = st.connection("gsheets", type=GSheetsConnection)
        return conn
    except Exception:
        return None

def load_data_from_storage() -> dict:
    """Wczytuje aktualny stan z Google Sheets lub lokalnego pliku JSON"""
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
                            
                    # Odczyt zapisanego oficjalnego budżetu jeśli obecny
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

    # Fallback: odczyt z trwałego pliku JSON
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
    """Zapisuje dane do Google Sheets oraz do pliku JSON"""
    # 1. Zapis lokalny/chmurowy JSON
    try:
        with open(LOCAL_DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception:
        pass

    # 2. Zapis do Google Sheets jeśli dostępne
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

# Inicjalizacja session_state
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
# 4. ALGORYTM LOSOWANIA Z WYKLUCZENIAMI (BEZWZGLĘDNA BIJEKCJA I BRAK MAŁŻONKA)
# ==============================================================================
def run_secret_santa_draw(names: List[str]) -> Optional[Dict[str, str]]:
    """Gwarantuje, że nikt nie wylosuje siebie ani partnera z pary."""
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

    # Relaxed fallback (bez 2-pętli)
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
# 5. OBLICZANIE AKTUALNEGO ETAPU PROCESU
# ==============================================================================
# Liczba oddanych głosów na budżet
voted_count = len([name for name in NAMES if name in st.session_state.budget_votes])
is_stage_1_done = voted_count >= TOTAL_MEMBERS

# Liczba wpisanych list życzeń (co najmniej 1 życzenie wpisane)
wishes_count = len([name for name in NAMES if len(st.session_state.wishes.get(name, [])) > 0])
is_stage_2_done = is_stage_1_done and (wishes_count >= TOTAL_MEMBERS)

# Czy losowanie zostało przeprowadzone
is_drawn = len(st.session_state.assignments) == TOTAL_MEMBERS

# Wyliczenie średniego budżetu
all_votes = list(st.session_state.budget_votes.values())
calculated_avg_budget = int(round(sum(all_votes) / len(all_votes))) if all_votes else 150

# Automatyczne ustawienie oficjalnego budżetu i wykonanie losowania po Etapie 2
if is_stage_1_done and "budget_finalized" not in st.session_state:
    st.session_state.official_budget = calculated_avg_budget
    st.session_state.budget_finalized = True

if is_stage_2_done and not is_drawn:
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

# Wyznaczenie numeru aktywnego etapu (1, 2 lub 3)
if not is_stage_1_done:
    current_stage = 1
elif not is_stage_2_done:
    current_stage = 2
else:
    current_stage = 3

# ==============================================================================
# 6. GŁÓWNY INTERFEJS STREAMLIT DLA RODZINY
# ==============================================================================

st.markdown("<h1>🎅 Świąteczny Secret Santa dla Rodziny</h1>", unsafe_allow_html=True)
st.write("Aplikacja prowadzi całą rodzinę krok po kroku przez 3 etapy. Kolejny etap odblokowuje się, gdy wszyscy ukończą bieżący!")

# Pasek postępu 3 etapów
badge_1 = "badge-done" if is_stage_1_done else ("badge-active" if current_stage == 1 else "badge-locked")
badge_2 = "badge-done" if is_stage_2_done else ("badge-active" if current_stage == 2 else "badge-locked")
badge_3 = "badge-done" if is_drawn else ("badge-active" if current_stage == 3 else "badge-locked")

st.markdown(f"""
<div class="step-banner">
    <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
        <span class="step-badge {badge_1}">Etap 1: Budżet ({voted_count}/{TOTAL_MEMBERS})</span>
        <span style="color:#94a3b8; font-weight:bold;">&rarr;</span>
        <span class="step-badge {badge_2}">Etap 2: Listy życzeń ({wishes_count}/{TOTAL_MEMBERS})</span>
        <span style="color:#94a3b8; font-weight:bold;">&rarr;</span>
        <span class="step-badge {badge_3}">Etap 3: Losowanie i Tajny Podgląd</span>
    </div>
</div>
""", unsafe_allow_html=True)

# ------------------------------------------------------------------------------
# ETAP 1: ZBIERANIE BUDŻETÓW (ODBLOKOWANE GDY voted_count < 12)
# ------------------------------------------------------------------------------
if current_stage == 1:
    st.markdown("<h2>💰 Etap 1: Zbieranie propozycji budżetu na prezent</h2>", unsafe_allow_html=True)
    st.info(f"📊 **Postęp: Wypełniło {voted_count} z {TOTAL_MEMBERS} osób.** Gdy wszyscy wpiszą kwotę, system automatycznie wyliczy wspólną średnią i przejdzie do zbierania list życzeń!")

    col1, col2 = st.columns([1, 1])
    with col1:
        st.markdown("### 👤 Kto teraz głosuje?")
        voter = st.selectbox("Wybierz swoje imię:", options=NAMES, key="s1_user")
        voter_pin = st.text_input("Wpisz swój 4-cyfrowy kod PIN:", type="password", max_chars=6, key="s1_pin", placeholder="np. 1001")
        with st.expander("💡 Zapomniałeś PIN? Sprawdź tutaj"):
            st.write(f"Domyślny PIN dla **{voter}**: `{PARTICIPANTS[voter]['pin']}`")

    with col2:
        st.markdown("### 💵 Twoja propozycja kwoty:")
        current_val = st.session_state.budget_votes.get(voter, 150)
        
        # Szybkie kafelki kwot
        preset_cols = st.columns(4)
        for i, amt in enumerate([50, 100, 150, 200]):
            with preset_cols[i]:
                if st.button(f"{amt} zł", use_container_width=True, key=f"btn_amt_{amt}"):
                    current_val = amt

        selected_amount = st.number_input("Lub wpisz dowolną kwotę (zł):", min_value=20, max_value=1000, value=current_val, step=10, key="s1_amount")

        if st.button("💾 ZAPISZ MÓJ GŁOS", type="primary", use_container_width=True):
            if voter_pin.strip() == PARTICIPANTS[voter]["pin"]:
                st.session_state.budget_votes[voter] = int(selected_amount)
                save_data_to_storage({
                    "budget_votes": st.session_state.budget_votes,
                    "wishes": st.session_state.wishes,
                    "assignments": st.session_state.assignments,
                    "official_budget": st.session_state.official_budget
                })
                st.success(f"Dziękujemy, {voter}! Twój głos ({selected_amount} zł) został pomyślnie zapisany w chmurze.")
                st.rerun()
            else:
                st.error("❌ Błędny kod PIN! Sprawdź podpowiedź pod polem PIN.")

    # Lista obecnego stanu głosowania (kto oddał głos)
    st.markdown("---")
    st.markdown("### 📋 Kto już oddał głos:")
    cols_status = st.columns(4)
    for idx, name in enumerate(NAMES):
        has_voted = name in st.session_state.budget_votes
        with cols_status[idx % 4]:
            if has_voted:
                st.success(f"✅ {name}")
            else:
                st.warning(f"⏳ {name}")

    # Panel awaryjnego przejścia dla organizatora (gdyby ktoś nie mógł zagłosować)
    with st.expander("⚙️ Opcja dla organizatora (przejdź dalej z obecną średnią)"):
        st.write(f"Obecna średnia z oddanych głosów: **{calculated_avg_budget} zł**")
        if st.button("Zatwierdź obecną kwotę i odblokuj Etap 2 natychmiast"):
            for n in NAMES:
                if n not in st.session_state.budget_votes:
                    st.session_state.budget_votes[n] = calculated_avg_budget
            st.session_state.official_budget = calculated_avg_budget
            save_data_to_storage({
                "budget_votes": st.session_state.budget_votes,
                "wishes": st.session_state.wishes,
                "assignments": st.session_state.assignments,
                "official_budget": st.session_state.official_budget
            })
            st.rerun()

# ------------------------------------------------------------------------------
# ETAP 2: ZBIERANIE LIST ŻYCZEŃ (ODBLOKOWANE GDY ETAP 1 ZAKOŃCZONY)
# ------------------------------------------------------------------------------
elif current_stage == 2:
    st.markdown("<h2>📝 Etap 2: Zbieranie list życzeń na prezent</h2>", unsafe_allow_html=True)
    st.success(f"🎉 **Etap 1 zakończony!** Ustalony wspólny budżet rodziny: **{st.session_state.official_budget} zł**.")
    st.info(f"📊 **Postęp życzeń: Wypełniło {wishes_count} z {TOTAL_MEMBERS} osób.** Wpisz 2-3 pomysły na to, co chciałbyś/chciałabyś dostać pod choinkę!")

    col_w1, col_w2 = st.columns([1, 1])
    with col_w1:
        st.markdown("### 👤 Wybierz swoje imię:")
        w_person = st.selectbox("Dla kogo wpisujesz życzenia?", options=NAMES, key="s2_user")
        w_pin = st.text_input("Wpisz swój kod PIN:", type="password", max_chars=6, key="s2_pin")
        with st.expander("💡 Zapomniałeś PIN?"):
            st.write(f"Domyślny PIN dla **{w_person}**: `{PARTICIPANTS[w_person]['pin']}`")

    with col_w2:
        st.markdown("### 🎁 Twoje pomysły na prezent świąteczny:")
        current_wishes = st.session_state.wishes.get(w_person, ["", "", ""])
        while len(current_wishes) < 3:
            current_wishes.append("")

        p1 = st.text_input("1. Pierwszy pomysł:", value=current_wishes[0], key="s2_p1", placeholder="np. Ciepły wełniany szal")
        p2 = st.text_input("2. Drugi pomysł:", value=current_wishes[1], key="s2_p2", placeholder="np. Dobra kawa ziarnista lub herbata")
        p3 = st.text_input("3. Trzeci pomysł:", value=current_wishes[2], key="s2_p3", placeholder="np. Książka kryminalna")

        if st.button("💾 ZAPISZ MOJĄ LISTĘ ŻYCZEŃ", type="primary", use_container_width=True):
            if w_pin.strip() == PARTICIPANTS[w_person]["pin"]:
                clean = [p.strip() for p in [p1, p2, p3] if p.strip()]
                if not clean:
                    st.warning("Wpisz przynajmniej jeden pomysł na prezent!")
                else:
                    st.session_state.wishes[w_person] = clean
                    save_data_to_storage({
                        "budget_votes": st.session_state.budget_votes,
                        "wishes": st.session_state.wishes,
                        "assignments": st.session_state.assignments,
                        "official_budget": st.session_state.official_budget
                    })
                    st.success(f"Brawo, {w_person}! Twoja lista życzeń została zapisana.")
                    st.rerun()
            else:
                st.error("❌ Błędny kod PIN!")

    # Status uzupełnienia list
    st.markdown("---")
    st.markdown("### 📋 Kto już uzupełnił listę życzeń:")
    cols_wishes_stat = st.columns(4)
    for idx, name in enumerate(NAMES):
        has_w = len(st.session_state.wishes.get(name, [])) > 0
        with cols_wishes_stat[idx % 4]:
            if has_w:
                st.success(f"✅ {name}")
            else:
                st.warning(f"⏳ {name}")

    # Awaryjne odblokowanie Etapu 3 dla organizatora
    with st.expander("⚙️ Opcja dla organizatora (przejdź do losowania od razu)"):
        if st.button("Przeprowadź losowanie i odblokuj Etap 3 teraz"):
            drawn_pairs = run_secret_santa_draw(NAMES)
            if drawn_pairs:
                st.session_state.assignments = drawn_pairs
                save_data_to_storage({
                    "budget_votes": st.session_state.budget_votes,
                    "wishes": st.session_state.wishes,
                    "assignments": st.session_state.assignments,
                    "official_budget": st.session_state.official_budget
                })
                st.rerun()

# ------------------------------------------------------------------------------
# ETAP 3: LOSOWANIE I TAJNY PODGLĄD WYNIKÓW (ODBLOKOWANE GDY WSZYSTKO GOTOWE)
# ------------------------------------------------------------------------------
elif current_stage == 3:
    st.markdown("<h2>🎁 Etap 3: Tajny podgląd wylosowanej osoby</h2>", unsafe_allow_html=True)
    st.success("🎉 **Wszystkie etapy zakończone!** Losowanie odbyło się z bezwzględnym wykluczeniem małżonków i samego siebie.")

    col_look1, col_look2 = st.columns([1, 1])
    with col_look1:
        st.markdown("### 👤 Kto chce sprawdzić swój los?")
        look_user = st.selectbox("Wybierz swoje imię:", options=NAMES, key="s3_user")
        look_pin = st.text_input("Wpisz swój kod PIN:", type="password", max_chars=6, key="s3_pin", placeholder="Wpisz 4 cyfry")
        with st.expander("💡 Potrzebujesz pomocy z PIN-em?"):
            st.write(f"Domyślny PIN dla **{look_user}**: `{PARTICIPANTS[look_user]['pin']}`")

    with col_look2:
        st.markdown("### 🔒 Weryfikacja i podgląd:")
        if not look_pin:
            st.info("👈 Wpisz swój kod PIN po lewej stronie, aby bezpiecznie podejrzeć wylosowaną osobę.")
        elif look_pin.strip() != PARTICIPANTS[look_user]["pin"]:
            st.error("❌ Błędny kod PIN. Spróbuj ponownie lub użyj podpowiedzi.")
        else:
            receiver = st.session_state.assignments.get(look_user)
            if receiver:
                st.success("✅ Tożsamość potwierdzona! Oto Twój wynik:")
                
                # Wielka świąteczna karta z wynikiem
                st.markdown(f"""
                <div class="gift-box">
                    <div style="font-size: 1.15rem; text-transform: uppercase; letter-spacing: 2px;">Kupujesz prezent dla:</div>
                    <h1>🎁 {receiver} 🎁</h1>
                    <div style="font-size: 1.1rem; opacity: 0.9;">
                        ({PARTICIPANTS[receiver]['pair']} · Partner: {PARTICIPANTS[receiver]['partner']})
                    </div>
                </div>
                """, unsafe_allow_html=True)

                st.markdown(f"### 💰 Obowiązujący budżet: **{st.session_state.official_budget} zł**")

                # Lista życzeń wylosowanej osoby
                r_wishes = st.session_state.wishes.get(receiver, [])
                st.markdown(f"### 📝 Pomysły na prezent od {receiver}:")
                if r_wishes:
                    for i, w in enumerate(r_wishes, 1):
                        st.markdown(f"**{i}.** {w}")
                else:
                    st.info(f"{receiver} nie wpisał(a) jeszcze konkretnych życzeń.")

                # Przygotowanie wiadomości na WhatsApp i SMS
                w_text = "\\n".join([f"{i+1}. {w}" for i, w in enumerate(r_wishes)])
                sms_body = (
                    f"🎁 Cześć {look_user}! W rodzinnym Secret Santa wylosowałeś(aś): {receiver}! "
                    f"Budżet: {st.session_state.official_budget} zł. "
                    f"Pomysły na prezent: {w_text}. Wesołych Świąt!"
                )
                wa_url = f"https://wa.me/?text={urllib.parse.quote(sms_body)}"
                sms_url = f"sms:?&body={urllib.parse.quote(sms_body)}"

                st.markdown("---")
                st.markdown("#### Zapisz sobie na telefonie:")
                c_wa, c_sms = st.columns(2)
                with c_wa:
                    st.link_button("💬 Otwórz w WhatsApp", wa_url, use_container_width=True)
                with c_sms:
                    st.link_button("📱 Wyślij jako SMS", sms_url, use_container_width=True)

                st.markdown("---")
                st.info("🔒 **Ważne dla dyskrecji:** Po zapoznaniu się z wynikiem skasuj wpisany PIN z pola po lewej stronie, aby kolejna osoba nie podejrzała Twojego losu!")

    # Panel Administratora
    st.markdown("---")
    with st.expander("📋 Panel Organizatora (Wszystkie pary - dla administratora)"):
        st.warning("Uwaga: Ta tabela zawiera pełną listę wszystkich 12 wylosowanych par!")
        show_admin = st.checkbox("Wyświetl pełną tabelę organizatora", value=False)
        if show_admin:
            rows = []
            for giver in NAMES:
                rec = st.session_state.assignments.get(giver, "—")
                rec_w = ", ".join(st.session_state.wishes.get(rec, []))
                rows.append({
                    "Dający": giver,
                    "Para": PARTICIPANTS[giver]["pair"],
                    "PIN": PARTICIPANTS[giver]["pin"],
                    "Wylosowany": rec,
                    "Lista życzeń": rec_w,
                })
            df_admin = pd.DataFrame(rows)
            st.dataframe(df_admin, use_container_width=True)
            
            csv_export = df_admin.to_csv(index=False).encode('utf-8')
            st.download_button(
                "📥 Pobierz kopię tabeli (CSV)",
                data=csv_export,
                file_name="secret_santa_wszystkie_pary.csv",
                mime="text/csv"
            )
