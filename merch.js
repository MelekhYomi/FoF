(function () {
  var root = document.getElementById('merch-root');
  if (!root) return;

  var WHATSAPP = '2348038577654';
  var NAIRA = '₦';
  var COLORS = [
    { id: 'black', name: 'Black', hex: '#111111' },
    { id: 'navy', name: 'Navy Blue', hex: '#14235a' },
    { id: 'red', name: 'Red', hex: '#d4161c' },
    { id: 'white', name: 'White', hex: '#ffffff' }
  ];
  var PRODUCTS = [
    { id: 'shirt', name: 'DWELL T-Shirt', price: 7000 },
    { id: 'sweatshirt', name: 'DWELL Sweatshirt', price: 9000 },
    { id: 'tote', name: 'DWELL Tote Bag', price: 7000 },
    { id: 'mug', name: 'DWELL Mug', price: 4494 }
  ];

  var cart = [];

  function money(n) { return NAIRA + n.toLocaleString('en-NG'); }
  function colorOf(id) { return COLORS.filter(function (c) { return c.id === id; })[0]; }
  function productOf(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }
  function photo(productId, colorId) { return 'merch/' + productId + '-' + colorId + '.jpg'; }

  var grid = document.createElement('div');
  grid.className = 'merch-grid';
  PRODUCTS.forEach(function (p) {
    var card = document.createElement('article');
    card.className = 'merch-card';
    card.dataset.product = p.id;
    card.dataset.color = COLORS[0].id;
    card.dataset.qty = '1';
    card.innerHTML =
      '<div class="merch-photo"><img src="' + photo(p.id, COLORS[0].id) + '" alt="' + p.name + ' in ' + COLORS[0].name + '" loading="lazy"></div>' +
      '<h4>' + p.name + '</h4>' +
      '<p class="merch-price">' + money(p.price) + '</p>' +
      '<div class="merch-swatches" role="radiogroup" aria-label="Choose a colour">' +
      COLORS.map(function (c, i) {
        return '<button type="button" class="swatch" role="radio" aria-checked="' + (i === 0) + '" aria-label="' + c.name + '" data-color="' + c.id + '" style="background:' + c.hex + '"></button>';
      }).join('') +
      '</div>' +
      '<div class="merch-colorname">' + COLORS[0].name + '</div>' +
      '<div class="merch-actions">' +
      '<div class="qty"><button type="button" class="qty-minus" aria-label="Decrease quantity">&minus;</button><span class="qty-val">1</span><button type="button" class="qty-plus" aria-label="Increase quantity">+</button></div>' +
      '<button type="button" class="merch-add">Add to order</button>' +
      '</div>';
    grid.appendChild(card);
  });
  root.appendChild(grid);

  var order = document.createElement('div');
  order.className = 'merch-order';
  order.hidden = true;
  order.innerHTML =
    '<h3>Your order</h3><ul class="merch-lines"></ul>' +
    '<div class="merch-total"><span>Total</span><span class="merch-total-val"></span></div>' +
    '<a class="merch-checkout" target="_blank" rel="noopener">Proceed to order on WhatsApp</a>' +
    '<p class="merch-note">You’ll be taken to WhatsApp to confirm sizes and delivery, and to make payment.</p>';
  root.appendChild(order);

  var bar = document.createElement('div');
  bar.className = 'merch-bar';
  bar.hidden = true;
  bar.innerHTML = '<div class="merch-bar-info"><span class="merch-bar-count"></span><small class="merch-bar-total"></small></div>' +
    '<a class="merch-bar-go" target="_blank" rel="noopener">Order on WhatsApp</a>';
  document.body.appendChild(bar);

  function message() {
    var total = 0;
    var lines = cart.map(function (l, i) {
      var p = productOf(l.product), c = colorOf(l.color), sub = p.price * l.qty;
      total += sub;
      return (i + 1) + '. ' + p.name + ' (' + c.name + ') x' + l.qty + ' - ' + money(sub);
    });
    return 'Hello FOF team! I’d like to order the following merch:\n\n' + lines.join('\n') +
      '\n\nTotal: ' + money(total) + '\n\nPlease send me the payment details so I can complete my order.';
  }

  function render() {
    var count = 0, total = 0;
    var list = order.querySelector('.merch-lines');
    list.innerHTML = '';
    cart.forEach(function (l, idx) {
      var p = productOf(l.product), c = colorOf(l.color);
      count += l.qty; total += p.price * l.qty;
      var li = document.createElement('li');
      li.innerHTML =
        '<img src="' + photo(l.product, l.color) + '" alt="">' +
        '<div class="merch-line-info"><strong>' + p.name + '</strong><span>' + c.name + ' · Qty ' + l.qty + '</span></div>' +
        '<div class="merch-line-total">' + money(p.price * l.qty) + '</div>' +
        '<button type="button" class="merch-remove" data-idx="' + idx + '" aria-label="Remove ' + p.name + ' (' + c.name + ')">×</button>';
      list.appendChild(li);
    });
    order.hidden = cart.length === 0;
    order.querySelector('.merch-total-val').textContent = money(total);
    if (cart.length) {
      var href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(message());
      order.querySelector('.merch-checkout').href = href;
      bar.querySelector('.merch-bar-go').href = href;
      bar.querySelector('.merch-bar-count').textContent = count + (count === 1 ? ' item' : ' items') + ' in your order';
      bar.querySelector('.merch-bar-total').textContent = 'Total ' + money(total);
    }
    syncBar();
  }

  var sectionVisible = false;
  function syncBar() { bar.hidden = !(cart.length && sectionVisible); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      sectionVisible = entries[0].isIntersecting;
      syncBar();
    }, { threshold: 0.05 }).observe(root.closest('.merch') || root);
  } else {
    sectionVisible = true;
  }

  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.merch-card');
    if (!card) return;
    var sw = e.target.closest('.swatch');
    if (sw) {
      var c = colorOf(sw.dataset.color);
      card.dataset.color = c.id;
      card.querySelectorAll('.swatch').forEach(function (s) { s.setAttribute('aria-checked', String(s === sw)); });
      var img = card.querySelector('.merch-photo img');
      img.src = photo(card.dataset.product, c.id);
      img.alt = productOf(card.dataset.product).name + ' in ' + c.name;
      card.querySelector('.merch-colorname').textContent = c.name;
      return;
    }
    var qv = card.querySelector('.qty-val');
    if (e.target.closest('.qty-minus')) {
      card.dataset.qty = String(Math.max(1, +card.dataset.qty - 1)); qv.textContent = card.dataset.qty; return;
    }
    if (e.target.closest('.qty-plus')) {
      card.dataset.qty = String(Math.min(20, +card.dataset.qty + 1)); qv.textContent = card.dataset.qty; return;
    }
    var add = e.target.closest('.merch-add');
    if (add) {
      var pid = card.dataset.product, cid = card.dataset.color, q = +card.dataset.qty;
      var existing = cart.filter(function (l) { return l.product === pid && l.color === cid; })[0];
      if (existing) existing.qty = Math.min(50, existing.qty + q); else cart.push({ product: pid, color: cid, qty: q });
      render();
      card.dataset.qty = '1';
      qv.textContent = '1';
      add.textContent = 'Added ✓';
      add.classList.add('is-added');
      setTimeout(function () { add.textContent = 'Add to order'; add.classList.remove('is-added'); }, 1200);
    }
  });

  order.addEventListener('click', function (e) {
    var rm = e.target.closest('.merch-remove');
    if (!rm) return;
    cart.splice(+rm.dataset.idx, 1);
    render();
  });
})();
