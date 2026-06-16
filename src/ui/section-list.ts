import { reorderSections } from '../state';
import type { Section } from '../types';
import { renderSectionCard } from './section-card';

let draggedId: string | null = null;

export function renderSectionList(sections: Section[]): HTMLElement {
  const list = document.createElement('div');
  list.className = 'section-list';

  if (sections.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <p>No sections yet. Add your first section to define tempo and time signature changes.</p>
      </div>
    `;
    return list;
  }

  sections.forEach((section, index) => {
    const card = renderSectionCard(section, index);
    bindDragAndDrop(card, sections);
    list.appendChild(card);
  });

  return list;
}

function bindDragAndDrop(card: HTMLElement, sections: Section[]): void {
  const sectionId = card.dataset.sectionId!;

  card.addEventListener('dragstart', (event) => {
    draggedId = sectionId;
    card.classList.add('section-card--dragging');
    event.dataTransfer?.setData('text/plain', sectionId);
    event.dataTransfer!.effectAllowed = 'move';
  });

  card.addEventListener('dragend', () => {
    draggedId = null;
    card.classList.remove('section-card--dragging');
    document.querySelectorAll('.section-card--drop-target').forEach((element) => {
      element.classList.remove('section-card--drop-target');
    });
  });

  card.addEventListener('dragover', (event) => {
    event.preventDefault();
    if (!draggedId || draggedId === sectionId) {
      return;
    }
    card.classList.add('section-card--drop-target');
    event.dataTransfer!.dropEffect = 'move';
  });

  card.addEventListener('dragleave', () => {
    card.classList.remove('section-card--drop-target');
  });

  card.addEventListener('drop', (event) => {
    event.preventDefault();
    card.classList.remove('section-card--drop-target');

    if (!draggedId || draggedId === sectionId) {
      return;
    }

    const fromIndex = sections.findIndex((section) => section.id === draggedId);
    const toIndex = sections.findIndex((section) => section.id === sectionId);

    if (fromIndex >= 0 && toIndex >= 0) {
      reorderSections(fromIndex, toIndex);
    }
  });
}