emailjs.init("lPKkoYZ14FvjwKJkL");

/* === bloc suivant === */

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-574RVNPM6S');

/* === bloc suivant === */


/* === bloc suivant === */

function lbOpen(src) {
  document.getElementById('lb-img').src = src;
  document.getElementById('lb-overlay').style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function lbClose() {
  document.getElementById('lb-overlay').style.display = 'none';
  document.getElementById('lb-img').src = '';
  document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { lbClose(); }
});
window.addEventListener('load', function() {
  var skipClasses = ['hero-owm-logo','branch-logo','client-logo','footer-logo','nav-logo'];
  var imgs = document.getElementsByTagName('img');
  for (var i = 0; i < imgs.length; i++) {
    (function(img) {
      var cls = img.className || '';
      for (var s = 0; s < skipClasses.length; s++) {
        if (cls.indexOf(skipClasses[s]) !== -1) return;
      }
      var p = img.parentNode;
      while (p) {
        if (p.tagName && p.tagName.toUpperCase() === 'A') return;
        p = p.parentNode;
      }
      img.className = cls ? cls + ' lb-zoom' : 'lb-zoom';
      img.onclick = function(e) {
        e.stopPropagation();
        lbOpen(img.src);
      };
    })(imgs[i]);
  }
});

/* === bloc suivant === */

document.getElementById("contact-form").addEventListener("submit", function(e) {
    e.preventDefault();
    var btn = this.querySelector(".btn-submit");
    btn.textContent = "Envoi en cours...";
    btn.disabled = true;
    emailjs.sendForm("service_9o5e19g", "template_p9ocj6o", this)
        .then(function() {
            return emailjs.sendForm("service_9o5e19g", "template_9bvaz5n", document.getElementById("contact-form"));
        })
        .then(function() {
            btn.textContent = "Message envoyé !";
            document.getElementById("contact-form").reset();
        }, function() {
            btn.textContent = "Erreur — réessayez";
            btn.disabled = false;
        });
});

/* === bloc suivant === */

(function() {
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.branch-card, .offre-card, .manifeste-grid, .clients-grid, .contact-section, .branches-intro, .section-label');
    elements.forEach(function(el, i) {
      el.classList.add('fade-in-up');
      el.style.transitionDelay = (i % 3) * 0.15 + 's';
    });

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right').forEach(function(el) {
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    initScrollAnimations();
  }
})();

/* === bloc suivant === */

// ── LOADER ──
window.addEventListener('load', function() {
  var loader = document.getElementById('page-loader');
  setTimeout(function() {
    loader.style.opacity = '0';
    setTimeout(function() {
      loader.style.display = 'none';
    }, 800);
  }, 1200);
});

// ── CURSEUR ──
var cursor = document.getElementById('custom-cursor');
var ring = document.getElementById('custom-cursor-ring');
var ringX = 0, ringY = 0;

document.addEventListener('mousemove', function(e) {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  ringX += (e.clientX - ringX) * 0.12;
  ringY += (e.clientY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';
});

(function animateRing() {
  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';
  requestAnimationFrame(animateRing);
})();

var hoverEls = document.querySelectorAll('a, button, .offre-card, .branch-card, img.lb-zoom');
hoverEls.forEach(function(el) {
  el.addEventListener('mouseenter', function() {
    cursor.classList.add('hover');
    ring.classList.add('hover');
  });
  el.addEventListener('mouseleave', function() {
    cursor.classList.remove('hover');
    ring.classList.remove('hover');
  });
});

// ── NAV SCROLL ──
var nav = document.querySelector('nav');
if (nav) {
  window.addEventListener('scroll', function() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* === bloc suivant === */

function vlOpen(id){
  document.getElementById('vl-iframe').src='https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0';
  document.getElementById('vl-overlay').classList.add('active');
  document.body.style.overflow='hidden';
}
function vlClose(){
  document.getElementById('vl-iframe').src='';
  document.getElementById('vl-overlay').classList.remove('active');
  document.body.style.overflow='';
}
document.addEventListener('keydown',function(e){if(e.key==='Escape')vlClose();});