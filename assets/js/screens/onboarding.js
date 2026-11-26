/* ============================================================
   onboarding.js — Choix de langue, création de profil multi-usages
   (prénom/pseudo, niveau 1AF–7AS, série au lycée). Sans compte,
   sans email, sans publicité : tout reste sur le téléphone.
   ============================================================ */
import { el, mascot } from '../ui/components.js';
import { t, setLang, bi, getLang } from '../core/i18n.js';
import { loadCatalogue, getCatalogue } from '../core/content.js';
import { listProfiles, createProfile, switchProfile } from '../core/store.js';
import { navigate } from '../core/router.js';

export async function build() {
  await loadCatalogue();
  const cat = getCatalogue();
  const profiles = listProfiles();
  const root = el('div');

  /* ----- Liste des profils existants ----- */
  if (profiles.length) {
    const pick = el('div');
    pick.append(el('div', { class: 'hero' }, el('div', { html: mascot(96) }),
      el('h1', { text: 'Najma · نجمة' }), el('p', { text: t('slogan') })));
    pick.append(el('h2', { text: t('reprendre') }));
    for (const p of profiles) {
      const label = cat.niveaux.find(n => n.id === p.niveau);
      pick.append(el('button', { class: 'listrow', onclick: async () => {
        if (p.lang) setLang(p.lang);
        await switchProfile(p.id);
        navigate('#/home');
      } },
        el('span', { class: 'ic', html: '★' }),
        el('span', { class: 'grow' },
          el('span', { class: 't', text: p.name }),
          el('br'), el('span', { class: 's', text: (label ? bi(label.label) : p.niveau) + (p.serie ? ' · ' + p.serie : '') })),
        el('span', { class: 'chip gold', text: '→' })));
    }
    pick.append(el('button', { class: 'btn ghost big', style: 'margin-top:.8rem', text: '+ ' + t('ajouterProfil'), onclick: () => showForm() }));
    root.append(pick);
    return { root };
  }

  function showForm() {
    root.textContent = '';
    const state = { lang: getLang(), niveau: null, serie: null };

    root.append(el('div', { class: 'hero' }, el('div', { html: mascot(96) }),
      el('h1', { text: 'Najma · نجمة' }), el('p', { text: t('slogan') })));

    // Langue
    root.append(el('h2', { text: t('choisirLangue') }));
    const langs = el('div', { class: 'langpick' });
    const frB = el('button', { text: 'Français', 'aria-pressed': 'true' });
    const arB = el('button', { text: 'العربية', 'aria-pressed': 'false' });
    frB.addEventListener('click', () => { state.lang = 'fr'; setLang('fr'); frB.setAttribute('aria-pressed', 'true'); arB.setAttribute('aria-pressed', 'false'); });
    arB.addEventListener('click', () => { state.lang = 'ar'; setLang('ar'); arB.setAttribute('aria-pressed', 'true'); frB.setAttribute('aria-pressed', 'false'); });
    langs.append(frB, arB);
    root.append(langs);

    // Prénom
    const nameInput = el('input', { type: 'text', maxlength: '24', autocomplete: 'off', placeholder: t('tonPrenom') });
    root.append(el('label', { class: 'field' }, el('span', { text: t('tonPrenom') }), nameInput));

    // Niveaux par cycle
    root.append(el('h2', { text: t('tonNiveau') }));
    const cycleKeys = ['fondamental', 'college', 'lycee'];
    const cycleLabels = { fondamental: t('cycleFondamental'), college: t('cycleCollege'), lycee: t('cycleLycee') };
    for (const c of cycleKeys) {
      root.append(el('div', { class: 'cyclelabel', text: cycleLabels[c] }));
      const grid = el('div', { class: 'lvlgrid' });
      for (const n of cat.niveaux.filter(x => x.cycle === c)) {
        const b = el('button', { text: n.id, dataset: { lvl: n.id } },
          el('small', { text: bi(n.label).replace(/^.*·\s*/, '') }));
        b.addEventListener('click', () => {
          state.niveau = n.id;
          state.serie = null;
          grid.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
          renderSeries();
        });
        grid.append(b);
      }
      root.append(grid);
    }

    // Séries (7AS)
    const seriesZone = el('div');
    root.append(seriesZone);

    function renderSeries() {
      seriesZone.textContent = '';
      if (state.niveau !== '7AS') return;
      seriesZone.append(el('h2', { text: t('taSerie') }));
      const pickS = el('div', { class: 'pick' });
      for (const s of cat.series['7AS']) {
        const b = el('button', { text: `${s.id} — ${bi(s.label)}` });
        b.addEventListener('click', () => {
          state.serie = s.id;
          pickS.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        });
        pickS.append(b);
      }
      seriesZone.append(pickS);
    }

    // CTA
    const err = el('p', { class: 'chip err', text: '', style: 'display:none;margin:.6rem 0' });
    const cta = el('button', { class: 'btn gold big', style: 'margin-top:1rem', text: t('commencer') });
    cta.addEventListener('click', async () => {
      const name = nameInput.value.trim();
      if (!name) { err.textContent = t('nomRequis'); err.style.display = 'block'; return; }
      if (!state.niveau) { err.textContent = t('tonNiveau'); err.style.display = 'block'; return; }
      if (state.niveau === '7AS' && !state.serie) { err.textContent = t('serieObligatoire'); err.style.display = 'block'; return; }
      const p = await createProfile({ name, lang: state.lang, niveau: state.niveau, serie: state.serie });
      setLang(p.lang);
      navigate('#/home');
    });
    root.append(err, cta);
  }

  showForm();
  return { root };
}
