class ImageSlider {
    constructor(container, options = {}) {
        this.container = container;
        this.wrapper = this.container.querySelector('.slider-wrapper');
        this.slides = this.container.querySelectorAll('.slide');
        this.prevBtn = this.container.querySelector('.arrow-left');
        this.nextBtn = this.container.querySelector('.arrow-right');
        this.dotsContainer = this.container.querySelector('.dots-container');
        
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.isAnimating = false;
        
        this.autoPlay = options.autoPlay !== false;
        this.autoPlayInterval = null;
        this.autoPlayDelay = options.delay || 4000;

        this.init();
    }

    init() {
        this.waitForMedia().then(() => {
            this.createDots();
            this.bindEvents();
            this.touchSupport();
            this.adjustSlideHeights();
            
            if (this.autoPlay) {
                this.startAutoPlay();
            }
        });
    }

    startAutoPlay() {
        if (!this.autoPlay) return;
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => this.next(), this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    toggleAutoPlay() {
        if (this.autoPlayInterval) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    waitForMedia() {
        const promises = Array.from(this.slides).map(slide => {
            const img = slide.querySelector('img');
            const video = slide.querySelector('video');
            const mediaPromises = [];
            
            if (img) {
                if (img.complete) {
                    mediaPromises.push(Promise.resolve());
                } else {
                    mediaPromises.push(new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    }));
                }
            }
            
            if (video) {
                if (video.readyState >= 1) {
                    mediaPromises.push(Promise.resolve());
                } else {
                    mediaPromises.push(new Promise(resolve => {
                        video.addEventListener('loadedmetadata', resolve);
                        video.addEventListener('error', resolve);
                        setTimeout(resolve, 3000);
                    }));
                }
            }
            
            return Promise.all(mediaPromises);
        });
        return Promise.all(promises);
    }

    adjustSlideHeights() {
        this.slides.forEach(slide => {
            const img = slide.querySelector('img');
            const video = slide.querySelector('video');
            const media = img || video;
            
            if (media) {
                const containerWidth = this.container.offsetWidth;
                let ratio;
                if (img) {
                    ratio = img.naturalHeight / img.naturalWidth;
                } else if (video) {
                    ratio = video.videoHeight / video.videoWidth;
                }
                slide.style.height = `${containerWidth * ratio}px`;
                media.style.width = '100%';
                media.style.height = '100%';
                media.style.objectFit = 'contain';
                media.style.display = 'block';
            }
        });
    }

    createDots() {
        this.dotsContainer.innerHTML = '';
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dot.dataset.index = i;
            if (i === 0) dot.classList.add('active');
            this.dotsContainer.appendChild(dot);
        }
    }

    bindEvents() {
        this.prevBtn.addEventListener('click', () => {
            this.prev();
            if (this.autoPlay) this.startAutoPlay();
        });
        
        this.nextBtn.addEventListener('click', () => {
            this.next();
            if (this.autoPlay) this.startAutoPlay();
        });
        
        this.dotsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('dot')) {
                this.goToSlide(parseInt(e.target.dataset.index));
                if (this.autoPlay) this.startAutoPlay();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prev();
                if (this.autoPlay) this.startAutoPlay();
            }
            if (e.key === 'ArrowRight') {
                this.next();
                if (this.autoPlay) this.startAutoPlay();
            }
        });

        if (this.autoPlay) {
            this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
            this.container.addEventListener('mouseleave', () => this.startAutoPlay());
        }

        window.addEventListener('resize', () => {
            this.adjustSlideHeights();
        });
    }

    updateDots() {
        const dots = this.dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    updateSlider() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.wrapper.style.transform = `translateX(-${this.currentIndex * 100}%)`;
        this.updateDots();
        setTimeout(() => { this.isAnimating = false; }, 500);
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlider();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.updateSlider();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateSlider();
    }

    touchSupport() {
        let touchStartX = 0;
        this.wrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.wrapper.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) diff > 0 ? this.next() : this.prev();
        }, { passive: true });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.slider-container');
    
    sliders.forEach(container => {
        const autoPlay = container.dataset.autoplay !== 'false';
        const delay = parseInt(container.dataset.delay) || 4000;
        
        new ImageSlider(container, {
            autoPlay: autoPlay,
            delay: delay
        });
    });
});