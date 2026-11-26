/* ============================================================
   settings.js — Réglages (langue, thème, taille de texte,
   export/import de sauvegarde) et gestion multi-profils.
   ============================================================ */
import { el, icon, appHeader, chip, toast, modal, langToggle } from '../ui/components.js';
import { t, setLang, nf } from '../core/i18n.js';
import { loadCatalogue, getCatalogue } from '../core/content.js';
import { currentProfile, getStore, setSettings, listProfiles, switchProfile, deleteProfile,
  updateProfile, exportAll, importAll, persistProfile } from '../core/store.js';
import { storageKind } from '../core/db.js';
import { navigate } from '../core/router.js';

export async function build() {
  const profile = currentProfile();
  if (!profile) { navigate('#/onboarding'); return { root: el('div') }; }
  const settings = getStore().settings;
  const root = el('div');

  root.append(appHeader(t('reglages'), { back: { hash: '#/home', label: t('accueil') } }));

  /* Langue */
  root.append(el('h2', { text: t('langue') }));
  const pickL = el('div', { class: 'pick' });
  for (const [code, label] of [['fr', 'Français'], ['ar', 'العربية']]) {
    const b = el('button', { text: label, 'aria-pressed': String((profile.lang || settings.lang || 'fr') === code) });
    b.addEventListener('click', async () => {
      profile.lang = code;
      setLang(code);
      await setSettings({ lang: code });
      await persistProfile();
      navigate('#/reglages');
    });
    pickL.append(b);
  }
  root.append(pickL);

  /* Thème */
  root.append(el('h2', { text: t('theme') }));
  const pickT = el('div', { class: 'pick' });
  for (const [code, label] of [['auto', t('auto')], ['light', t('clair')], ['dark', t('sombre')]]) {
    const b = el('button', { text: label, 'aria-pressed': String(settings.theme === code) });
    b.addEventListener('click', async () => {
      document.documentElement.dataset.theme = code;
      await setSettings({ theme: code });
      pickT.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    });
    pickT.append(b);
  }
  root.append(pickT);

  /* Taille du texte */
  root.append(el('h2', { text: t('taillePolice') }));
  const pickF = el('div', { class: 'pick' });
  for (const [code, label] of [['s', t('petite')], ['m', t('moyenne')], ['l', t('grande')]]) {
    const b = el('button', { text: label, 'aria-pressed': String((settings.font || 'm') === code) });
    b.addEventListener('click', async () => {
      document.documentElement.dataset.font = code;
      await setSettings({ font: code });
      pickF.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    });
    pickF.append(b);
  }
  root.append(pickF);

  /* Profils */
  root.append(el('h2', { text: t('profils') }));
  for (const p of listProfiles()) {
    const row = el('div', { class: 'listrow' });
    row.append(el('span', { class: 'ic', html: icon('users') }),
      el('span', { class: 'grow' },
        el('span', { class: 't', text: p.name + (p.id === profile.id ? ' ●' : '') }),
        el('br'), el('span', { class: 's', text: p.niveau + (p.serie ? ' · ' + p.serie : '') })));
    const switchBtn = el('button', { class: 'chip gold', text: p.id === profile.id ? '✓' : t('changerProfil') });
    switchBtn.addEventListener('click', async () => {
      if (p.lang) setLang(p.lang);
      await switchProfile(p.id);
      navigate('#/home');
    });
    row.append(switchBtn);
    root.append(row);
  }
  root.append(el('button', { class: 'btn ghost big', style: 'margin-top:.4rem', text: '+ ' + t('ajouterProfil'),
    onclick: () => navigate('#/onboarding') }));

  /* Sauvegarde */
  root.append(el('h2', { text: t('exporter') + ' / ' + t('importer') }));
  const saveRow = el('div', { class: 'row', style: 'flex-wrap:wrap' });
  saveRow.append(el('button', { class: 'btn primary', text: '⬇ ' + t('exporter'), onclick: async () => {
    const payload = await exportAll();
    const blob = new Blob([JSON.stringify(payload, null, 1)], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: 'najma-sauvegarde-' + new Date().toISOString().slice(0, 10) + '.json' });
    document.body.append(a); a.click(); a.remove();
    toast(t('exportOk'));
  } }));
  const fileInput = el('input', { type: 'file', accept: '.json,application/json', style: 'display:none' });
  fileInput.addEventListener('change', async () => {
    const f = fileInput.files?.[0];
    if (!f) return;
    try {
      const payload = JSON.parse(await f.text());
      const ok = await modal({ title: t('confirmerImport'), body: t('donneesLocales'), okLabel: t('importer'), cancelLabel: t('retour'), danger: true });
      if (!ok) return;
      await importAll(payload);
      toast(t('importOk'));
      navigate('#/home');
    } catch {
      toast(t('importKo'));
    }
  });
  saveRow.append(fileInput);
  saveRow.append(el('button', { class: 'btn ghost', text: '⬆ ' + t('importer'),
    onclick: () => fileInput.click() }));
  root.append(saveRow);

  /* Suppression du profil courant */
  root.append(el('h2', { text: t('supprimerProfil') }));
  root.append(el('button', { class: 'btn danger big', text: t('supprimerProfil'), onclick: async () => {
    const ok = await modal({ title: t('confirmerSuppression'), okLabel: t('supprimerProfil'), cancelLabel: t('retour'), danger: true });
    if (!ok) return;
    await deleteProfile(profile.id);
    if (!listProfiles().length) navigate('#/onboarding');
    else navigate('#/home');
  } }));

  /* Infos */
  const kind = await storageKind();
  root.append(el('p', { class: 'empty', text: `Najma v1.0 · ${kind === 'idb' ? t('storageIdb') : kind === 'ls' ? t('storageLs') : t('storageMem')}` }));
  root.append(el('p', { class: 'empty', text: t('donneesLocales') }));
  return { root };
}

/* ---------- Écran PROFILS (raccourci depuis l'accueil) ---------- */
export async function buildProfils() {
  const cat = await loadCatalogue();
  const root = el('div');
  root.append(appHeader(t('profils'), { back: { hash: '#/home', label: t('accueil') } }));
  for (const p of listProfiles()) {
    const n = cat.niveaux.find(x => x.id === p.niveau);
    root.append(el('button', { class: 'listrow', onclick: async () => {
      if (p.lang) setLang(p.lang);
      await switchProfile(p.id);
      navigate('#/home');
    } },
      el('span', { class: 'ic', html: icon('users') }),
      el('span', { class: 'grow' }, el('span', { class: 't', text: p.name }),
        el('br'), el('span', { class: 's', text: (n ? p.niveau : '') + (p.serie ? ' · ' + p.serie : '') })),
      el('span', { class: 'chip gold', text: '→' })));
  }
  root.append(el('button', { class: 'btn ghost big', style: 'margin-top:.8rem', text: '+ ' + t('ajouterProfil'),
    onclick: () => navigate('#/onboarding') }));
  return { root };
}
