import {
  CLICK_INSTRUMENTS,
  GARAGEBAND_CLICK_IMPORT_STEPS,
  getClickInstrument,
  type ClickInstrumentId,
} from '../click-instruments';
import { downloadMidi } from '../midi/builder';
import {
  addSection,
  getClickTrackSettings,
  getSections,
  setClickInstrument,
  setClickTrackEnabled,
  subscribe,
} from '../state';
import { formatDuration, totalBars, totalDurationSeconds } from '../timing';
import { allSectionsValid } from '../validation';
import { renderSectionList } from './section-list';

export function mountApp(root: HTMLElement): void {
  root.innerHTML = `
    <div class="app">
      <header class="app__header">
        <div>
          <h1 class="app__title">Song Structure Builder</h1>
          <p class="app__subtitle">Build a MIDI tempo map for GarageBand</p>
        </div>
        <button class="button button--primary" id="download-btn" type="button" disabled>
          Download MIDI
        </button>
      </header>
      <section class="export-options" aria-label="MIDI export options">
        <label class="export-options__toggle">
          <input id="click-enabled" type="checkbox" />
          <span>Add click track</span>
        </label>
        <label class="export-options__instrument">
          <span class="field__label">Click sound (MIDI notes)</span>
          <select id="click-instrument" class="field__select" aria-label="Click instrument">
            ${CLICK_INSTRUMENTS.map(
              (instrument) => `<option value="${instrument.id}">${instrument.label}</option>`,
            ).join('')}
          </select>
        </label>
        <p class="export-options__hint" id="click-hint" hidden></p>
        <div class="garageband-help" id="garageband-help" hidden>
          <p class="garageband-help__title">GarageBand setup for the click track</p>
          <ol class="garageband-help__steps" id="garageband-steps"></ol>
          <p class="garageband-help__alt" id="garageband-alt" hidden></p>
        </div>
      </section>
      <main class="app__main">
        <div id="section-list-host"></div>
        <button class="button button--secondary" id="add-section-btn" type="button">
          + Add Section
        </button>
      </main>
      <footer class="app__footer" id="summary-footer" hidden>
        <span id="summary-bars"></span>
        <span class="summary-separator">·</span>
        <span id="summary-duration"></span>
      </footer>
    </div>
  `;

  const sectionListHost = root.querySelector<HTMLElement>('#section-list-host')!;
  const addSectionBtn = root.querySelector<HTMLButtonElement>('#add-section-btn')!;
  const downloadBtn = root.querySelector<HTMLButtonElement>('#download-btn')!;
  const summaryFooter = root.querySelector<HTMLElement>('#summary-footer')!;
  const summaryBars = root.querySelector<HTMLElement>('#summary-bars')!;
  const summaryDuration = root.querySelector<HTMLElement>('#summary-duration')!;
  const clickEnabledInput = root.querySelector<HTMLInputElement>('#click-enabled')!;
  const clickInstrumentSelect = root.querySelector<HTMLSelectElement>('#click-instrument')!;
  const clickHint = root.querySelector<HTMLElement>('#click-hint')!;
  const garageBandHelp = root.querySelector<HTMLElement>('#garageband-help')!;
  const garageBandSteps = root.querySelector<HTMLElement>('#garageband-steps')!;
  const garageBandAlt = root.querySelector<HTMLElement>('#garageband-alt')!;

  const syncExportOptions = (): void => {
    const clickTrack = getClickTrackSettings();
    const instrument = getClickInstrument(clickTrack.instrumentId);
    const usePluckSteps = instrument.id === 'pluck';

    clickEnabledInput.checked = clickTrack.enabled;
    clickInstrumentSelect.value = clickTrack.instrumentId;
    clickInstrumentSelect.disabled = !clickTrack.enabled;
    root.querySelector('.export-options')?.classList.toggle('export-options--active', clickTrack.enabled);

    clickHint.hidden = !clickTrack.enabled;
    garageBandHelp.hidden = !clickTrack.enabled;

    if (clickTrack.enabled) {
      clickHint.textContent = instrument.description;

      const steps = usePluckSteps
        ? GARAGEBAND_CLICK_IMPORT_STEPS
        : [
            'Add a new Software Instrument track (+ in the header).',
            `Select ${instrument.garageBandKit} in the Library.`,
            'Download and import the .mid file (File → Import → MIDI File).',
            'Drag the imported MIDI region onto that instrument track.',
          ];

      garageBandSteps.innerHTML = steps.map((step) => `<li>${step}</li>`).join('');
      garageBandAlt.hidden = usePluckSteps;
      garageBandAlt.textContent = usePluckSteps
        ? ''
        : 'Tip: for the clearest click, switch the preset to Future Rave Pluck (Synthesizer → Plucked).';
    }
  };

  const render = (): void => {
    const sections = getSections();
    sectionListHost.replaceChildren(renderSectionList(sections));
    syncExportOptions();

    const hasSections = sections.length > 0;
    summaryFooter.hidden = !hasSections;

    if (hasSections) {
      summaryBars.textContent = `${totalBars(sections)} bars`;
      summaryDuration.textContent = formatDuration(totalDurationSeconds(sections));
    }

    downloadBtn.disabled = !allSectionsValid(sections);
  };

  addSectionBtn.addEventListener('click', () => {
    addSection();
  });

  clickEnabledInput.addEventListener('change', () => {
    setClickTrackEnabled(clickEnabledInput.checked);
  });

  clickInstrumentSelect.addEventListener('change', () => {
    setClickInstrument(clickInstrumentSelect.value as ClickInstrumentId);
  });

  downloadBtn.addEventListener('click', () => {
    const sections = getSections();
    if (allSectionsValid(sections)) {
      downloadMidi(sections, { clickTrack: getClickTrackSettings() });
    }
  });

  subscribe(render);
  render();
}