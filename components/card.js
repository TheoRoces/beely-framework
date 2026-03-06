registerComponent('card', function (slots) {
  return ''
    + '<div class="card">'
    +   (slots.image
      ? '<div class="card__image"><img src="' + escapeSlotHtml(slots.image) + '" alt="' + escapeSlotHtml(slots.imageAlt || '') + '"></div>'
      : '')
    +   '<div class="card__body">'
    +     (slots.title ? '<h3 class="card__title">' + escapeSlotHtml(slots.title) + '</h3>' : '')
    +     (slots.text ? '<p class="card__text">' + escapeSlotHtml(slots.text) + '</p>' : '')
    +     (slots.footer ? '<div class="card__footer">' + slots.footer + '</div>' : '')
    +   '</div>'
    + '</div>';
});
