import { deleteSection, updateSection } from '../state';
import { formatDuration, sectionDurationSeconds } from '../timing';
import { DENOMINATOR_OPTIONS, type Section } from '../types';
import { validateSection } from '../validation';

export function renderSectionCard(section: Section, index: number): HTMLElement {
  const validation = validateSection(section);
  const card = document.createElement('article');
  card.className = 'section-card';
  card.dataset.sectionId = section.id;
  card.draggable = true;

  card.innerHTML = `
    <div class="section-card__drag" aria-hidden="true" title="Drag to reorder">≡</div>
    <div class="section-card__body">
      <div class="section-card__header">
        <span class="section-card__index">#${index + 1}</span>
        <input
          class="section-card__label"
          type="text"
          placeholder="Section label (optional)"
          value="${escapeHtml(section.label ?? '')}"
          aria-label="Section label"
        />
        <button class="section-card__delete" type="button" aria-label="Delete section">Delete</button>
      </div>
      <div class="section-card__fields">
        <label class="field">
          <span class="field__label">Time signature</span>
          <span class="time-sig-inputs">
            <input
              class="field__input field__input--narrow ${validation.errors.numerator ? 'field__input--error' : ''}"
              type="number"
              min="1"
              max="12"
              value="${section.numerator}"
              aria-label="Time signature numerator"
            />
            <span class="time-sig-separator">/</span>
            <select class="field__select field__input--narrow" aria-label="Time signature denominator">
              ${DENOMINATOR_OPTIONS.map(
                (denominator) =>
                  `<option value="${denominator}" ${section.denominator === denominator ? 'selected' : ''}>${denominator}</option>`,
              ).join('')}
            </select>
          </span>
        </label>
        <label class="field">
          <span class="field__label">Tempo</span>
          <span class="tempo-input">
            <input
              class="field__input field__input--narrow ${validation.errors.tempo ? 'field__input--error' : ''}"
              type="number"
              min="40"
              max="240"
              value="${section.tempo}"
              aria-label="Tempo in BPM"
            />
            <span class="field__suffix">BPM</span>
          </span>
        </label>
        <label class="field">
          <span class="field__label">Bars</span>
          <input
            class="field__input field__input--narrow ${validation.errors.bars ? 'field__input--error' : ''}"
            type="number"
            min="1"
            value="${section.bars}"
            aria-label="Number of bars"
          />
        </label>
        <div class="section-card__duration">
          <span class="field__label">Duration</span>
          <span class="section-card__duration-value">${formatDuration(sectionDurationSeconds(section))}</span>
        </div>
      </div>
      ${
        validation.valid
          ? ''
          : `<p class="section-card__errors">${Object.values(validation.errors).join(' · ')}</p>`
      }
    </div>
  `;

  bindSectionCard(card, section.id);
  return card;
}

function bindSectionCard(card: HTMLElement, sectionId: string): void {
  const labelInput = card.querySelector<HTMLInputElement>('.section-card__label')!;
  const numeratorInput = card.querySelector<HTMLInputElement>('input[aria-label="Time signature numerator"]')!;
  const denominatorSelect = card.querySelector<HTMLSelectElement>('select[aria-label="Time signature denominator"]')!;
  const tempoInput = card.querySelector<HTMLInputElement>('input[aria-label="Tempo in BPM"]')!;
  const barsInput = card.querySelector<HTMLInputElement>('input[aria-label="Number of bars"]')!;
  const deleteButton = card.querySelector<HTMLButtonElement>('.section-card__delete')!;

  labelInput.addEventListener('blur', () => {
    updateSection(sectionId, { label: labelInput.value });
  });

  numeratorInput.addEventListener('change', () => {
    updateSection(sectionId, { numerator: Number(numeratorInput.value) });
  });

  denominatorSelect.addEventListener('change', () => {
    updateSection(sectionId, {
      denominator: Number(denominatorSelect.value) as Section['denominator'],
    });
  });

  tempoInput.addEventListener('change', () => {
    updateSection(sectionId, { tempo: Number(tempoInput.value) });
  });

  barsInput.addEventListener('change', () => {
    updateSection(sectionId, { bars: Number(barsInput.value) });
  });

  deleteButton.addEventListener('click', () => {
    deleteSection(sectionId);
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}