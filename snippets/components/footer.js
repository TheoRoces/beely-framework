registerComponent('footer', function (slots) {
  var contentHtml = slots.content || '';
  var currentYear = new Date().getFullYear();
  var copyrightHtml = slots.copyright
    ? slots.copyright.replace(/\b20\d{2}\b/, currentYear)
    : '&copy; ' + currentYear;

  return `
    <footer class="footer">
      <div class="container footer__inner">
        ${contentHtml}
        <p class="footer__copy">${copyrightHtml}</p>
      </div>
    </footer>`;
});
