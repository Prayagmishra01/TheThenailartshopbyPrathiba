document.addEventListener('DOMContentLoaded', () => {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    if (!window.location.hash) {
        requestAnimationFrame(() => window.scrollTo(0, 0));
    }

    const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shouldReduceMotion = isMobileViewport || prefersReducedMotion;

    // Mobile Menu
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            const isOpen = navLinks.classList.contains('active');
            document.body.classList.toggle('menu-open', isOpen);
            mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
            mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        });
    }

    // Active Link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
        link.addEventListener('click', () => {
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuToggle?.classList.remove('active');
                document.body.classList.remove('menu-open');
                mobileMenuToggle?.setAttribute('aria-expanded', 'false');
                mobileMenuToggle?.setAttribute('aria-label', 'Open menu');
            }
        });
    });

    // Keep the navbar calm while scrolling. It intentionally scrolls away with the page.

    // Pagination, Lazy Loading & Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const grids = document.querySelectorAll('.gallery-grid, .masonry-grid, .instagram-grid, .detailed-services');
    
    grids.forEach(grid => {
        const items = Array.from(grid.querySelectorAll('.gallery-item, .masonry-item, .insta-item, .filter-item'));
        if (items.length === 0) return;
        
        let currentFilter = 'all';
        let visibleCount = 0;
        const batchSize = grid.classList.contains('detailed-services') ? items.length : 5;
        let scrollObserver = null;
        
        const loadMore = () => {
            const matchingItems = items.filter(item =>
                currentFilter === 'all' || item.classList.contains(currentFilter) || item.getAttribute('data-category') === currentFilter
            );
            
            const toShow = matchingItems.slice(visibleCount, visibleCount + batchSize);
            
            toShow.forEach(item => {
                item.style.display = '';
                
                // Lazy load media using data-src
                const media = item.querySelectorAll('img, video');
                media.forEach(m => {
                    if (m.hasAttribute('data-src')) {
                        m.src = m.getAttribute('data-src');
                        m.removeAttribute('data-src');
                        if (m.tagName === 'VIDEO') m.load();
                    }
                });
                
                if (shouldReduceMotion) {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                } else {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                }
            });
            
            visibleCount += toShow.length;
            
            if (toShow.length > 0) {
                // Observe the 2nd to last item shown in this batch to trigger next batch
                const triggerIndex = Math.max(0, toShow.length - 2);
                const triggerItem = toShow[triggerIndex];
                
                if (scrollObserver) scrollObserver.disconnect();
                
                if (!shouldReduceMotion) {
                    scrollObserver = new IntersectionObserver((entries) => {
                        if (entries[0].isIntersecting) {
                            scrollObserver.disconnect();
                            loadMore();
                        }
                    }, { rootMargin: "300px" });
                    
                    scrollObserver.observe(triggerItem);
                } else if (visibleCount < matchingItems.length) {
                    loadMore();
                }
            }
        };
        
        // Hide all initially
        items.forEach(item => {
            item.style.display = 'none';
            item.style.opacity = shouldReduceMotion ? '1' : '0';
            item.style.transform = shouldReduceMotion ? 'scale(1)' : 'scale(0.8)';
        });
        
        // Initial load
        loadMore();
        
        // Filter logic scoped to the page
        if (filterBtns.length > 0) {
            filterBtns.forEach(btn => {
                // Remove old event listeners if any, by redefining them (only safe if this code runs once)
                btn.addEventListener('click', () => {
                    if (btn.classList.contains('active')) return;
                    
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentFilter = btn.getAttribute('data-filter');
                    
                    if (scrollObserver) scrollObserver.disconnect();
                    
                    // Hide all current items
                    items.forEach(item => {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => { item.style.display = 'none'; }, 300);
                    });
                    
                    // Reset and load next batch for new filter
                    setTimeout(() => {
                        visibleCount = 0;
                        loadMore();
                    }, 350);
                });
            });
        }
    });

    const runCounters = (container, animate = true) => {
        const counters = container.querySelectorAll('.counter');
        if (!counters.length || container.classList.contains('counted')) return;
        container.classList.add('counted');
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            if (!animate) {
                counter.innerText = target.toLocaleString();
                counter.parentElement.style.opacity = 1;
                return;
            }

            const duration = 2500;
            let startTime = null;
            
            const update = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 4);
                const current = target * easeOut;
                
                counter.innerText = Math.ceil(current).toLocaleString();
                counter.parentElement.style.opacity = Math.max(0.2, progress);
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    counter.innerText = target.toLocaleString();
                    counter.parentElement.style.opacity = 1;
                }
            };
            requestAnimationFrame(update);
        });
    };

    // Scroll Animations
    if (shouldReduceMotion) {
        document.querySelectorAll('.fade-in, .stats-container').forEach(el => {
            el.classList.add('appear');
            runCounters(el, false);
        });
    } else {
    const appearOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('appear');
            runCounters(entry.target, true);
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    document.querySelectorAll('.fade-in, .stats-container').forEach(el => appearOnScroll.observe(el));
    }
    
    // Form processing
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = new FormData(bookingForm);
            const parts = [
                'Hi, I would like to book an appointment at Tha Nail Art Shop By Pratibha.',
                `Service: ${data.get('service') || 'Not selected'}`,
                `Name: ${data.get('name') || ''}`,
                `Preferred date/time: ${data.get('date') || ''} ${data.get('time') || ''}`.trim(),
                `Visit type: ${data.get('visit') || 'Studio visit'}`,
                `Notes: ${data.get('message') || 'No notes'}`
            ];
            window.open(`https://wa.me/917889123473?text=${encodeURIComponent(parts.join('\n'))}`, '_blank', 'noopener,noreferrer');
        });
    }

    // Lightbox Functionality
    const body = document.querySelector('body');
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous image"><i class="fas fa-chevron-left"></i></button><button class="lightbox-close" type="button" aria-label="Back from image"><i class="fas fa-arrow-left"></i></button><div class="lightbox-content-container"></div><button class="lightbox-nav lightbox-next" type="button" aria-label="Next image"><i class="fas fa-chevron-right"></i></button>';
    body.appendChild(lightbox);
    
    const lightboxContainer = lightbox.querySelector('.lightbox-content-container');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');
    let activeLightboxItems = [];
    let activeLightboxIndex = -1;
    let lightboxHistoryOpen = false;
    let touchStartX = 0;
    let touchStartY = 0;

    const getMediaSource = (media) => media?.getAttribute('data-src') || media?.getAttribute('src') || media?.currentSrc || '';

    const getLightboxGroup = (media) => {
        const explicitGroup = media.closest('[data-lightbox-group]')?.getAttribute('data-lightbox-group');
        if (explicitGroup) return explicitGroup;

        const filterItem = media.closest('.filter-item');
        if (filterItem) {
            const category = filterItem.getAttribute('data-category');
            if (category) return category;

            const classes = [...filterItem.classList].filter((name) => !['filter-item', 'masonry-item', 'gallery-item', 'img-hover', 'card-hover', 'all'].includes(name));
            if (classes.length) return classes[0];
        }

        const source = getMediaSource(media).replace(/\\/g, '/');
        const match = source.match(/(?:images|videos)\/([^/]+)/i);
        if (match) {
            return match[1].toLowerCase().replace(/\s+-\s+copy/g, '').replace(/\s+/g, '-');
        }

        return 'default';
    };

    const getScopedMediaItems = (media) => {
        const scope = media.closest('.gallery-grid, .masonry-grid, .instagram-grid, .reviews-grid, .portfolio-grid, .section, main') || document;
        return [...scope.querySelectorAll('img:not(.no-lightbox), video:not(.no-lightbox)')]
            .filter((item) => {
                if (item.getAttribute('alt') === 'Celebrity styled nails') return false;
                if (item.closest('a, button')) return false;
                return item.closest('.gallery-item, .masonry-item, .portfolio-grid, .gallery-grid, .reviews-grid, .instagram-grid');
            });
    };

    const getLightboxItemsFor = (media) => {
        const group = getLightboxGroup(media);
        const scopedItems = getScopedMediaItems(media);
        const groupedItems = scopedItems
            .filter((item) => {
                return getLightboxGroup(item) === group;
            });
        return groupedItems.length > 1 ? groupedItems : scopedItems;
    };

    const renderLightboxMedia = (media) => {
        lightboxContainer.innerHTML = '';

        if (media.tagName === 'IMG') {
            const fullImg = document.createElement('img');
            fullImg.src = getMediaSource(media);
            fullImg.alt = media.alt || 'Enlarged view';
            fullImg.onerror = function() {
                this.src = 'https://placehold.co/1200x800/f4e1e1/800020?text=Image+Unavailable';
                this.style.objectFit = 'contain';
            };
            lightboxContainer.appendChild(fullImg);
        } else if (media.tagName === 'VIDEO') {
            const fullVideo = document.createElement('video');
            fullVideo.src = getMediaSource(media);
            fullVideo.autoplay = true;
            fullVideo.controls = true;
            fullVideo.playsInline = true;
            fullVideo.style.maxHeight = '90vh';
            fullVideo.style.maxWidth = '90vw';
            lightboxContainer.appendChild(fullVideo);
        }

        const canNavigate = activeLightboxItems.length > 1;
        lightboxPrev.hidden = !canNavigate;
        lightboxNext.hidden = !canNavigate;
    };

    const showLightboxItem = (index) => {
        if (!activeLightboxItems.length) return;
        activeLightboxIndex = (index + activeLightboxItems.length) % activeLightboxItems.length;
        renderLightboxMedia(activeLightboxItems[activeLightboxIndex]);
    };

    const openLightbox = (media) => {
        activeLightboxItems = getLightboxItemsFor(media);
        activeLightboxIndex = activeLightboxItems.indexOf(media);
        if (activeLightboxIndex < 0) {
            activeLightboxItems = [media];
            activeLightboxIndex = 0;
        }
        showLightboxItem(activeLightboxIndex);
        lightbox.classList.add('active');
        body.classList.add('lightbox-open');
        body.style.overflow = 'hidden';
        if (!lightboxHistoryOpen) {
            history.pushState({ lightbox: true }, '', window.location.href);
            lightboxHistoryOpen = true;
        }
    };
    
    // Global Click Listener for Images & Videos (Event Delegation)
    document.addEventListener('click', (e) => {
        // Find if we clicked an img/video OR a container that has one
        let target = e.target.closest('img, video, .masonry-item, .gallery-item, .service-card, .service-card-detailed');
        if (!target) return;

        // If we clicked a container, find the image or video inside it
        let media = target;
        if (target.tagName !== 'IMG' && target.tagName !== 'VIDEO') {
            media = target.querySelector('img, video');
        }

        if (!media || media.classList.contains('no-lightbox')) return;
        
        const isCelebrity = media.getAttribute('alt') === 'Celebrity styled nails';
        if (isCelebrity) return;

        // If it's a link or button, don't open lightbox (unless it's specifically meant for it)
        if (e.target.closest('a, button') && !e.target.closest('.masonry-overlay')) {
            return; 
        }

        e.preventDefault();
        openLightbox(media);
    });
    
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        body.classList.remove('lightbox-open');
        body.style.overflow = '';
        lightboxContainer.innerHTML = '';
        activeLightboxItems = [];
        activeLightboxIndex = -1;
        lightboxHistoryOpen = false;
    };

    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        showLightboxItem(activeLightboxIndex - 1);
    });

    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        showLightboxItem(activeLightboxIndex + 1);
    });

    lightboxContainer.addEventListener('touchstart', (e) => {
        if (!lightbox.classList.contains('active') || e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    lightboxContainer.addEventListener('touchend', (e) => {
        if (!lightbox.classList.contains('active') || !touchStartX) return;
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        touchStartX = 0;
        touchStartY = 0;

        if (Math.abs(deltaX) < 45 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
        if (deltaX < 0) {
            showLightboxItem(activeLightboxIndex + 1);
        } else {
            showLightboxItem(activeLightboxIndex - 1);
        }
    }, { passive: true });
    
    lightbox.addEventListener('click', (e) => {
        if(e.target.closest('.lightbox-close')) history.back();
    });

    window.addEventListener('popstate', () => {
        if (lightbox.classList.contains('active')) closeLightbox();
    });
    
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && lightbox.classList.contains('active')) history.back();
        if(e.key === 'ArrowLeft' && lightbox.classList.contains('active')) showLightboxItem(activeLightboxIndex - 1);
        if(e.key === 'ArrowRight' && lightbox.classList.contains('active')) showLightboxItem(activeLightboxIndex + 1);
    });

    // Video Scroll Observer
    const videoOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5 // Play when 50% of the video is visible
    };
    
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(e => console.log('Autoplay prevented:', e));
            } else {
                video.pause();
            }
        });
    }, videoOptions);
    
    document.querySelectorAll('video').forEach(video => {
        // Remove standard autoplay from HTML so JS can control it strictly based on viewport
        video.removeAttribute('autoplay');
        video.preload = 'none';
        video.muted = true;
        video.playsInline = true;
        videoObserver.observe(video);
    });

    // Mobile Viewport Interaction for Image Overlays
    if (window.matchMedia("(max-width: 991px)").matches) {
        const centerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-center');
                } else {
                    entry.target.classList.remove('is-center');
                }
            });
        }, {
            root: null,
            rootMargin: "-40% 0px -40% 0px", // Trigger only when in the middle 20% of the viewport height
            threshold: 0
        });

        document.querySelectorAll('.gallery-item, .masonry-item').forEach(el => {
            centerObserver.observe(el);
        });
    }

    // Global Fallback for Broken Images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            if (!this.classList.contains('fallback-applied')) {
                this.classList.add('fallback-applied');
                // Use a styled placeholder that matches the brand colors (bg: blush pink, text: burgundy)
                this.src = 'https://placehold.co/600x600/f4e1e1/800020?text=The+Nail+Art+Shop';
                this.alt = 'Image temporarily unavailable';
                this.style.objectFit = 'contain';
                this.style.padding = '20px';
            }
        });
    });

    // Academy Carousel Navigation (Infinite Loop)
    const academyCarousel = document.getElementById('academyCarousel');
    const academyPrev = document.getElementById('academyPrev');
    const academyNext = document.getElementById('academyNext');

    if (academyCarousel && academyPrev && academyNext) {
        // Infinite Scroll Setup: Clone items
        const cards = Array.from(academyCarousel.querySelectorAll('.academy-card'));
        cards.forEach(card => {
            const cloneBefore = card.cloneNode(true);
            const cloneAfter = card.cloneNode(true);
            academyCarousel.insertBefore(cloneBefore, academyCarousel.firstChild);
            academyCarousel.appendChild(cloneAfter);
        });

        // Initial scroll to the middle set
        const scrollAmount = () => {
            const card = academyCarousel.querySelector('.academy-card');
            return card ? card.offsetWidth + 25 : 320;
        };
        
        const centerCarousel = () => {
            academyCarousel.scrollLeft = academyCarousel.scrollWidth / 3;
        };

        window.addEventListener('load', centerCarousel);
        setTimeout(centerCarousel, 500);

        const handleScroll = (direction) => {
            const step = scrollAmount();
            const targetScroll = direction === 'next' 
                ? academyCarousel.scrollLeft + step 
                : academyCarousel.scrollLeft - step;
            
            academyCarousel.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        };

        academyPrev.onclick = (e) => { e.preventDefault(); handleScroll('prev'); };
        academyNext.onclick = (e) => { e.preventDefault(); handleScroll('next'); };

        const checkInfinite = () => {
            const totalWidth = academyCarousel.scrollWidth;
            const viewWidth = academyCarousel.clientWidth;
            const scrollLeft = academyCarousel.scrollLeft;

            // Jump back to middle if we go too far
            if (scrollLeft <= 5) {
                academyCarousel.scrollTo({ left: totalWidth / 3, behavior: 'auto' });
            } else if (scrollLeft + viewWidth >= totalWidth - 5) {
                academyCarousel.scrollTo({ left: (totalWidth / 3) - viewWidth + (totalWidth / 3), behavior: 'auto' });
                // Simplified jump:
                academyCarousel.scrollLeft = totalWidth / 3;
            }
        };

        academyCarousel.addEventListener('scroll', checkInfinite);
    }
});
