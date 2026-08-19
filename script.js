const burger = document.querySelector('.burger');
const navLinks = document.querySelector('.nav-links');
burger.addEventListener('click', () => {
  const open = navLinks.style.display === 'flex';
  navLinks.style.cssText = open ? '' : 'display:flex; position:absolute; top:78px; left:0; right:0; background:#fff; flex-direction:column; padding:20px 28px; gap:18px; border-bottom:1px solid #e2e8f2;';
});
