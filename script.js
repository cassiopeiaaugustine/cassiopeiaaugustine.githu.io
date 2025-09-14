document.addEventListener('DOMContentLoaded', function() {
  const themeSwitch = document.getElementById('theme-switch');
  const body = document.body;

  const currentTheme = localStorage.getItem('theme') || 'light';
  body.setAttribute('data-theme', currentTheme);
  if (currentTheme === 'dark') themeSwitch.checked = true;

  themeSwitch.addEventListener('change', function() {
    if (this.checked) {
      body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      body.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  });

  const workElements = document.querySelectorAll('.work');
  workElements.forEach(work => {
    work.addEventListener('mouseenter', function() {
      this.classList.add('hover-active');
    });
    work.addEventListener('mouseleave', function() {
      this.classList.remove('hover-active');
    });
  });

  let carouselState = {
    currentSlide: 0,
    isAnimating: false,
    slides: [],
    tabs: [],
    totalSlides: 0,
    angleStep: 0
  };

  function initCarousel() {
    carouselState.slides = document.querySelectorAll('.carousel-slide');
    carouselState.tabs = document.querySelectorAll('.tab-button');
    carouselState.totalSlides = carouselState.slides.length;
    
    if (carouselState.totalSlides === 0) return;

    carouselState.angleStep = 360 / carouselState.totalSlides;
    
    carouselState.slides.forEach((slide, index) => {
      const angle = carouselState.angleStep * index;
      const rotateY = `rotateY(${angle}deg)`;
      const translateZ = `translateZ(300px)`;
      
      slide.style.transform = `${rotateY} ${translateZ}`;
      slide.style.opacity = index === 0 ? '1' : '0.7';
    });

    carouselState.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => goToSlide(index));
    });

    updateActiveTab();
    updateCarouselRotation();
  }

  function goToSlide(targetIndex) {
    if (carouselState.isAnimating || targetIndex === carouselState.currentSlide) return;
    
    carouselState.isAnimating = true;
    carouselState.currentSlide = targetIndex;
    
    updateCarouselRotation();
    updateActiveTab();
    
    setTimeout(() => {
      carouselState.isAnimating = false;
    }, 800);
  }

  function updateCarouselRotation() {
    const track = document.querySelector('.carousel-track');
    if (!track) return;
    
    const rotationAngle = -carouselState.currentSlide * carouselState.angleStep;
    track.style.transform = `rotateY(${rotationAngle}deg)`;
    
    carouselState.slides.forEach((slide, index) => {
      const distance = Math.abs(index - carouselState.currentSlide);
      const minDistance = Math.min(distance, carouselState.totalSlides - distance);
      
      if (index === carouselState.currentSlide) {
        slide.style.opacity = '1';
        slide.style.filter = 'brightness(1)';
      } else if (minDistance === 1) {
        slide.style.opacity = '0.7';
        slide.style.filter = 'brightness(0.8)';
      } else {
        slide.style.opacity = '0.4';
        slide.style.filter = 'brightness(0.6)';
      }
    });
  }

  function updateActiveTab() {
    carouselState.tabs.forEach((tab, index) => {
      if (index === carouselState.currentSlide) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  }

  window.nextSlide = function() {
    const nextIndex = (carouselState.currentSlide + 1) % carouselState.slides.length;
    goToSlide(nextIndex);
  };

  window.previousSlide = function() {
    const prevIndex = (carouselState.currentSlide - 1 + carouselState.slides.length) % carouselState.slides.length;
    goToSlide(prevIndex);
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') previousSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });

  setTimeout(initCarousel, 200);

  let originalContent = {};
  let isEditingMode = {};

  window.toggleEditMode = function(section) {
    const contentElement = document.getElementById(`${section}-content`);
    const editBtn = document.getElementById(`edit-${section}-btn`);
    const editControls = document.getElementById(`${section}-edit-controls`);
    
    if (!isEditingMode[section]) {
      originalContent[section] = contentElement.innerHTML;
      contentElement.contentEditable = true;
      contentElement.classList.add('editing');
      contentElement.focus();
      
      editBtn.style.display = 'none';
      editControls.style.display = 'flex';
      isEditingMode[section] = true;
      
      contentElement.style.outline = '2px dashed rgba(255, 255, 255, 0.5)';
    }
  };

  window.saveEdit = function(section) {
    const contentElement = document.getElementById(`${section}-content`);
    const editBtn = document.getElementById(`edit-${section}-btn`);
    const editControls = document.getElementById(`${section}-edit-controls`);
    
    localStorage.setItem(`${section}Content`, contentElement.innerHTML);
    
    contentElement.contentEditable = false;
    contentElement.classList.remove('editing');
    contentElement.style.outline = 'none';
    
    editBtn.style.display = 'block';
    editControls.style.display = 'none';
    isEditingMode[section] = false;
    
    showSaveNotification();
  };

  window.cancelEdit = function(section) {
    const contentElement = document.getElementById(`${section}-content`);
    const editBtn = document.getElementById(`edit-${section}-btn`);
    const editControls = document.getElementById(`${section}-edit-controls`);
    
    contentElement.innerHTML = originalContent[section];
    contentElement.contentEditable = false;
    contentElement.classList.remove('editing');
    contentElement.style.outline = 'none';
    
    editBtn.style.display = 'block';
    editControls.style.display = 'none';
    isEditingMode[section] = false;
  };

  function showSaveNotification() {
    const notification = document.createElement('div');
    notification.innerHTML = '<i class="fas fa-check"></i> Changes saved successfully!';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(34, 197, 94, 0.9);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      backdrop-filter: blur(10px);
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  }

  function loadSavedContent() {
    const savedBioContent = localStorage.getItem('bioContent');
    if (savedBioContent) {
      const bioElement = document.getElementById('bio-content');
      if (bioElement) {
        bioElement.innerHTML = savedBioContent;
      }
    }
  }

  loadSavedContent();

  const scriptURL = 'https://script.google.com/macros/s/AKfycbxcZ1IhWVJ7zr13dGJooqjdgEUqH4NH2wZ14brq0mNsBUIllWKSYC5-314OBLsg0-qqrQ/exec';
  const form = document.forms['submit-to-google-sheet'];
  const msg = document.getElementById("msg");

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      
      msg.innerHTML = "Sent successfully";
      msg.style.color = "#00ff41";
      msg.style.fontWeight = "bold";
      
      setTimeout(() => { 
        msg.innerHTML = "";
        form.reset();
      }, 3000);
      
      fetch(scriptURL, { method: 'POST', body: new FormData(form)})
        .then(response => {
          console.log('Form submitted successfully');
        })
        .catch(error => {
          console.error('Error submitting form:', error.message);
        });
    });
  }

  const editBtn = document.getElementById("edit-about-btn");
  const aboutDesc = document.getElementById("about-description");
  let isEditing = false;

  if (editBtn && aboutDesc) {
    const savedContent = localStorage.getItem("aboutContent");
    if (savedContent) {
      const cleanContent = savedContent.replace(/[\u200B-\u200D\uFEFF]/g, '');
      aboutDesc.innerHTML = cleanContent;
    }

    editBtn.addEventListener("click", () => {
      if (!isEditing) {
        aboutDesc.setAttribute("contenteditable", "true");
        aboutDesc.classList.add("editing");
        aboutDesc.focus();
        editBtn.innerHTML = "💾 Save";
        editBtn.classList.add("save-mode");
        isEditing = true;
        
        aboutDesc.style.outline = "2px dashed var(--accent-color)";
        aboutDesc.style.backgroundColor = "var(--bg-secondary)";
        aboutDesc.style.padding = "15px";
        aboutDesc.style.borderRadius = "8px";
        
        const hint = document.createElement("div");
        hint.id = "edit-hint";
        hint.innerHTML = "💡 Click anywhere to edit the text. Press Ctrl+Enter to save quickly.";
        hint.style.cssText = `
          font-size: 14px;
          color: var(--accent-color);
          margin-top: 10px;
          font-style: italic;
          opacity: 0.8;
        `;
        aboutDesc.parentNode.insertBefore(hint, editBtn);
        
      } else {
        aboutDesc.setAttribute("contenteditable", "false");
        aboutDesc.classList.remove("editing");
        editBtn.innerHTML = "✏️ Edit";
        editBtn.classList.remove("save-mode");
        isEditing = false;
        
        aboutDesc.style.outline = "none";
        aboutDesc.style.backgroundColor = "transparent";
        aboutDesc.style.padding = "0";
        aboutDesc.style.borderRadius = "0";
        
        const cleanContent = aboutDesc.innerHTML.replace(/[\u200B-\u200D\uFEFF]/g, '');
        localStorage.setItem("aboutContent", cleanContent);
        
        const hint = document.getElementById("edit-hint");
        if (hint) {
          hint.remove();
        }
        
        showSaveConfirmation();
      }
    });

    aboutDesc.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter" && isEditing) {
        e.preventDefault();
        editBtn.click();
      }
    });
  }

  function showSaveConfirmation() {
    const confirmation = document.createElement("div");
    confirmation.innerHTML = "✅ Changes saved successfully!";
    confirmation.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--accent-color);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 500;
      z-index: 9999;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(confirmation);
    
    setTimeout(() => {
      confirmation.style.animation = "slideOutRight 0.3s ease-in";
      setTimeout(() => {
        confirmation.remove();
      }, 300);
    }, 2000);
  }

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        if (entry.boundingClientRect.top > 0) {
          entry.target.classList.remove('visible');
        }
      }
    });
  }, observerOptions);

  const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');
  animatedElements.forEach(el => observer.observe(el));

  const workItems = document.querySelectorAll('.work.scale-in');
  workItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.2}s`;
  });

  const navbar = document.querySelector('nav');
  
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    navbar.style.transform = 'translateY(0)';
    
    if (scrollTop > 50) {
      navbar.style.backdropFilter = 'blur(20px)';
      navbar.style.backgroundColor = 'rgba(255, 69, 0, 0.98)';
      navbar.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
    } else {
      navbar.style.backdropFilter = 'blur(15px)';
      navbar.style.backgroundColor = 'rgba(255, 69, 0, 0.95)';
      navbar.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
    }
  });

  let ticking = false;
  
  function updateScrollAnimations() {
    const scrolled = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    const intro = document.querySelector('.Intro');
    if (intro) {
      const rate = scrolled * -0.3;
      intro.style.transform = `translateY(${rate}px)`;
    }
    
    const sections = document.querySelectorAll('#about, #projects, #contact');
    sections.forEach((section, index) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionCenter = sectionTop + (sectionHeight / 2);
      const distanceFromCenter = Math.abs(scrolled + (windowHeight / 2) - sectionCenter);
      const maxDistance = windowHeight;
      
      if (distanceFromCenter < maxDistance) {
        const progress = 1 - (distanceFromCenter / maxDistance);
        const opacity = Math.max(0.3, progress);
        const translateY = (1 - progress) * 50;
        
        section.style.opacity = opacity;
        section.style.transform = `translateY(${translateY}px)`;
      } else {
        section.style.opacity = '0.3';
        section.style.transform = 'translateY(50px)';
      }
    });
    
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollAnimations);
      ticking = true;
    }
  });

  const sections = document.querySelectorAll('#about, #projects, #contact');
  sections.forEach(section => {
    section.style.opacity = '0.3';
    section.style.transform = 'translateY(50px)';
    section.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  });
  
  updateScrollAnimations();

  const typingText = document.getElementById('typing-text');
  const roles = ['Web Developer', 'Programmer', 'Student'];
  let currentRoleIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeText() {
    const currentRole = roles[currentRoleIndex];
    
    if (isDeleting) {
      typingText.textContent = currentRole.substring(0, currentCharIndex - 1);
      currentCharIndex--;
      typingSpeed = 0;
    } else {
      typingText.textContent = currentRole.substring(0, currentCharIndex + 1);
      currentCharIndex++;
      typingSpeed = 100;
    }

    if (!isDeleting && currentCharIndex === currentRole.length) {
      setTimeout(() => {
        isDeleting = true;
      }, 1000);
    } else if (isDeleting && currentCharIndex === 0) {
      isDeleting = false;
      currentRoleIndex = (currentRoleIndex + 1) % roles.length;
    }

    setTimeout(typeText, typingSpeed);
  }

  setTimeout(typeText, 1000);
});

function editTabContent(tabName) {
  const tabContent = document.getElementById(tabName);
  const editBtn = tabContent.querySelector('.tab-edit-btn');
  
  if (tabName === 'bio') {
    const bioContent = tabContent.querySelector('.bio-content');
    
    if (editBtn.textContent.includes('Edit')) {
      editBtn.innerHTML = '💾 Save Bio';
      
      const paragraphs = bioContent.querySelectorAll('p');
      paragraphs.forEach(p => {
        p.contentEditable = true;
        p.style.border = '1px dashed #ff4500';
        p.style.padding = '8px';
        p.style.margin = '5px 0';
        p.style.borderRadius = '4px';
        p.style.backgroundColor = 'rgba(255, 69, 0, 0.05)';
      });
      
    } else {
      saveBioContent();
      editBtn.innerHTML = '✏️ Edit Bio';
      
      const paragraphs = bioContent.querySelectorAll('p');
      paragraphs.forEach(p => {
        p.contentEditable = false;
        p.style.border = 'none';
        p.style.padding = '';
        p.style.margin = '';
        p.style.borderRadius = '';
        p.style.backgroundColor = '';
      });
      
      showSaveConfirmation();
    }
    return;
  }
  
  const ul = tabContent.querySelector('ul');
  
  if (editBtn.textContent.includes('Edit')) {
    editBtn.innerHTML = '💾 Save ' + tabName.charAt(0).toUpperCase() + tabName.slice(1);
    
    const listItems = ul.querySelectorAll('li');
    listItems.forEach(li => {
      li.contentEditable = true;
      li.style.border = '1px dashed #ff4500';
      li.style.padding = '8px';
      li.style.margin = '5px 0';
      li.style.borderRadius = '4px';
      li.style.backgroundColor = 'rgba(255, 69, 0, 0.05)';
      
      li.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (confirm('Delete this item?')) {
          li.remove();
          saveTabContent(tabName);
        }
      });
    });
    
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn2 add-item-btn';
    addBtn.innerHTML = '➕ Add New ' + tabName.charAt(0).toUpperCase() + tabName.slice(1).slice(0, -1);
    addBtn.onclick = () => addNewItem(tabName);
    ul.parentNode.insertBefore(addBtn, editBtn);
    
  } else {
    saveTabContent(tabName);
    editBtn.innerHTML = '✏️ Edit ' + tabName.charAt(0).toUpperCase() + tabName.slice(1);
    
    const listItems = ul.querySelectorAll('li');
    listItems.forEach(li => {
      li.contentEditable = false;
      li.style.border = 'none';
      li.style.padding = '';
      li.style.margin = '';
      li.style.borderRadius = '';
      li.style.backgroundColor = '';
      
      li.removeEventListener('contextmenu', li.contextMenuHandler);
    });
    
    const addBtn = tabContent.querySelector('.add-item-btn');
    if (addBtn) {
      addBtn.remove();
    }
    
    showSaveConfirmation();
  }
}

function addNewItem(tabName) {
  const ul = document.getElementById(tabName).querySelector('ul');
  const newLi = document.createElement('li');
  
  if (tabName === 'skills') {
    newLi.innerHTML = '<span>New Skill</span><br />Click to edit this skill<br />Add description here';
  } else if (tabName === 'education') {
    newLi.innerHTML = '<span>Year</span><br />New Education Entry';
  } else if (tabName === 'experience') {
    newLi.innerHTML = '<span>Year</span><br />New Experience Entry';
  }
  
  newLi.contentEditable = true;
  newLi.style.border = '1px dashed #ff4500';
  newLi.style.padding = '8px';
  newLi.style.margin = '5px 0';
  newLi.style.borderRadius = '4px';
  newLi.style.backgroundColor = 'rgba(255, 69, 0, 0.05)';
  
  newLi.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (confirm('Delete this item?')) {
      newLi.remove();
      saveTabContent(tabName);
    }
  });
  
  ul.appendChild(newLi);
  newLi.focus();
}

function saveBioContent() {
  const bioContent = document.querySelector('#bio .bio-content');
  const paragraphs = bioContent.querySelectorAll('p');
  const content = [];
  
  paragraphs.forEach(p => {
    const cleanContent = p.innerHTML.replace(/[\u200B-\u200D\uFEFF]/g, '');
    content.push(cleanContent);
  });
  
  localStorage.setItem('bioContent', JSON.stringify(content));
}

function saveTabContent(tabName) {
  if (tabName === 'bio') {
    saveBioContent();
    return;
  }
  
  const ul = document.getElementById(tabName).querySelector('ul');
  const listItems = ul.querySelectorAll('li');
  const content = [];
  
  listItems.forEach(li => {
    const cleanContent = li.innerHTML.replace(/[\u200B-\u200D\uFEFF]/g, '');
    content.push(cleanContent);
  });
  
  localStorage.setItem(tabName + 'Content', JSON.stringify(content));
}

function loadBioContent() {
  const savedContent = localStorage.getItem('bioContent');
  if (savedContent) {
    const content = JSON.parse(savedContent);
    const bioContent = document.querySelector('#bio .bio-content');
    
    bioContent.innerHTML = '';
    content.forEach(paragraphContent => {
      const p = document.createElement('p');
      p.innerHTML = paragraphContent;
      bioContent.appendChild(p);
    });
  }
}

function loadTabContent(tabName) {
  if (tabName === 'bio') {
    loadBioContent();
    return;
  }
  
  const savedContent = localStorage.getItem(tabName + 'Content');
  if (savedContent) {
    const content = JSON.parse(savedContent);
    const ul = document.getElementById(tabName).querySelector('ul');
    
    ul.innerHTML = '';
    content.forEach(itemContent => {
      const li = document.createElement('li');
      li.innerHTML = itemContent;
      ul.appendChild(li);
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  loadTabContent('bio');
  loadTabContent('skills');
  loadTabContent('education');
  loadTabContent('experience');
});
