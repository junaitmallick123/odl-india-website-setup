const form = document.querySelector('#brief');
const requestedProduct = new URLSearchParams(location.search).get('product');
if ([...form.elements.product.options].some(option => option.value === requestedProduct)) {
  form.elements.product.value = requestedProduct;
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const values = new FormData(form);
  const body = ['ODL India product enquiry', '', `Product: ${values.get('product')}`, `Quantity: ${values.get('quantity')}`, '', 'Requirements:', values.get('requirements') || '—'].join('\n');
  const url = URL.createObjectURL(new Blob([body], {type: 'text/plain;charset=utf-8'}));
  const download = document.createElement('a');
  download.href = url;
  download.download = 'ODL-India-enquiry.txt';
  download.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector('#brief-status').textContent = 'Your enquiry brief is ready to share.';
});
form.hidden = false;
