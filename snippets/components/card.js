registerComponent('card', function (slots) {
  var imageHtml = slots.image
    ? `<div class="card__image"><img src="${escapeSlotHtml(slots.image)}" alt="${escapeSlotHtml(slots.imageAlt || '')}"></div>`
    : '';

  return `
    <div class="card">
      ${imageHtml}
      <div class="card__body">
        ${slots.title ? `<h3 class="card__title">${escapeSlotHtml(slots.title)}</h3>` : ''}
        ${slots.text ? `<p class="card__text">${escapeSlotHtml(slots.text)}</p>` : ''}
        ${slots.footer ? `<div class="card__footer">${slots.footer}</div>` : ''}
      </div>
    </div>`;
});
