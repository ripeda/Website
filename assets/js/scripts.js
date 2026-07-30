var body = document.querySelector('body')
var menuTrigger = document.querySelector('#toggle-main-menu-mobile');
var menuContainer = document.querySelector('#main-menu-mobile');

if (menuTrigger) {
    menuTrigger.onclick = function() {
        menuContainer.classList.toggle('open');
        menuTrigger.classList.toggle('is-active')
        body.classList.toggle('lock-scroll')
    }
}

// Navigation dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    // Desktop dropdown functionality
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(function(toggle) {
        toggle.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent navigation for Services dropdown
        });
    });

    // Mobile dropdown functionality
    const mobileDropdownToggles = document.querySelectorAll('.dropdown-toggle-mobile');
    mobileDropdownToggles.forEach(function(toggle) {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const parentLi = this.parentNode;
            const dropdownMenu = parentLi.querySelector('.dropdown-menu-mobile');
            const arrow = this.querySelector('.dropdown-arrow');

            // Toggle the dropdown
            if (dropdownMenu.style.display === 'block') {
                dropdownMenu.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            } else {
                // Close other mobile dropdowns first
                document.querySelectorAll('.dropdown-menu-mobile').forEach(function(menu) {
                    menu.style.display = 'none';
                });
                document.querySelectorAll('.dropdown-toggle-mobile .dropdown-arrow').forEach(function(arr) {
                    arr.style.transform = 'rotate(0deg)';
                });

                // Open this dropdown
                dropdownMenu.style.display = 'block';
                arrow.style.transform = 'rotate(180deg)';
            }
        });
    });

// Homepage 2026 - Expandable sections functionality
    // Challenge items expandable functionality with visual switching
    const challengeItems = document.querySelectorAll('.challenge-item[data-expandable]');
    const problemVisuals = document.querySelectorAll('.problem-visual');

    challengeItems.forEach(function(item) {
        item.addEventListener('click', function() {
            const problemType = this.getAttribute('data-expandable');

            // Toggle expanded class
            item.classList.toggle('expanded');

            // Close other expanded items in the same section
            challengeItems.forEach(function(otherItem) {
                if (otherItem !== item) {
                    otherItem.classList.remove('expanded');
                }
            });

            // Switch visual illustration
            problemVisuals.forEach(function(visual) {
                visual.classList.remove('active');
            });

            if (item.classList.contains('expanded')) {
                // Use more specific selector to target the desktop visual, not mobile image
                const targetVisual = document.querySelector(`.problem-visual[data-problem="${problemType}"]`);
                if (targetVisual) {
                    targetVisual.classList.add('active');
                }
            } else {
                // Show default visual when nothing is expanded
                const defaultVisual = document.querySelector('[data-problem="default"]');
                if (defaultVisual) {
                    defaultVisual.classList.add('active');
                }
            }
        });
    });

    // Lifecycle stage items expandable functionality with video switching
    const stageItems = document.querySelectorAll('.stage-item[data-expandable]');
    const lifecycleVideos = document.querySelectorAll('.lifecycle-video');

    // Prevent mobile stage video clicks from toggling the stage item
    document.querySelectorAll('.mobile-stage-video').forEach(function(mobileVideo) {
        mobileVideo.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });

    // Pause all hidden videos on resize (prevents ghost audio when switching between mobile/desktop)
    window.addEventListener('resize', function() {
        document.querySelectorAll('video').forEach(function(video) {
            var container = video.closest('.mobile-stage-video, .lifecycle-video');
            if (container) {
                var isHidden = window.getComputedStyle(container).display === 'none' ||
                               window.getComputedStyle(container.closest('.section-visual') || container).display === 'none';
                if (isHidden && !video.paused) {
                    video.pause();
                }
            }
        });
    });

    // Disable fullscreen on mobile videos via JS
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.mobile-stage-video video').forEach(function(video) {
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.setAttribute('controlsList', 'nofullscreen');
            // Block fullscreen requests
            video.addEventListener('webkitbeginfullscreen', function(e) {
                e.preventDefault();
                this.webkitExitFullscreen && this.webkitExitFullscreen();
            });
            video.addEventListener('fullscreenchange', function() {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
            });
            video.addEventListener('webkitfullscreenchange', function() {
                if (document.webkitFullscreenElement) {
                    document.webkitExitFullscreen();
                }
            });
        });
    }

    stageItems.forEach(function(item) {
        item.addEventListener('click', function() {
            const stageType = this.getAttribute('data-expandable');

            // Toggle expanded class
            item.classList.toggle('expanded');

            // Close other expanded items in the same section
            stageItems.forEach(function(otherItem) {
                if (otherItem !== item) {
                    otherItem.classList.remove('expanded');
                }
            });

            // Switch video panel
            lifecycleVideos.forEach(function(videoPanel) {
                videoPanel.classList.remove('active');
                // Pause any playing videos when switching away
                const video = videoPanel.querySelector('video');
                if (video && !video.paused) {
                    video.pause();
                }
            });

            if (item.classList.contains('expanded')) {
                // Activate the corresponding video panel
                const targetVideo = document.querySelector(`.lifecycle-video[data-stage="${stageType}"]`);
                if (targetVideo) {
                    targetVideo.classList.add('active');
                    // Reset video to beginning when switching to it
                    const video = targetVideo.querySelector('video');
                    if (video) {
                        video.currentTime = 0;
                    }
                }
            } else {
                // Show first stage video as default when nothing is expanded
                const defaultVideo = document.querySelector('.lifecycle-video[data-stage="procurement"]');
                if (defaultVideo) {
                    defaultVideo.classList.add('active');
                }
            }
        });
    });

    // Engineering methodology items expandable functionality with visual switching
    const methodItems = document.querySelectorAll('.method-item[data-expandable]');
    const engineeringVisuals = document.querySelectorAll('.engineering-visual');

    methodItems.forEach(function(item) {
        item.addEventListener('click', function() {
            const methodType = this.getAttribute('data-expandable');

            // Toggle expanded class
            item.classList.toggle('expanded');

            // Close other expanded items in the same section
            methodItems.forEach(function(otherItem) {
                if (otherItem !== item) {
                    otherItem.classList.remove('expanded');
                    // Remove any mobile video containers
                    const existingMobileVideo = otherItem.querySelector('.mobile-video-container');
                    if (existingMobileVideo) {
                        existingMobileVideo.remove();
                    }
                }
            });

            // Switch visual demonstration - properly handle all visuals
            engineeringVisuals.forEach(function(visual) {
                visual.classList.remove('active');

                // Pause any playing videos when switching away
                const video = visual.querySelector('video');
                if (video && !video.paused) {
                    video.pause();
                }
            });

            if (item.classList.contains('expanded')) {
                const targetVisual = document.querySelector(`[data-method="${methodType}"]`);
                if (targetVisual) {
                    targetVisual.classList.add('active');

                    // If the target visual has a video, ensure it's ready to play
                    const targetVideo = targetVisual.querySelector('video');
                    if (targetVideo) {
                        // Reset video to beginning when switching to it
                        targetVideo.currentTime = 0;
                    }

                    // Mobile-specific: Insert video content below this method item
                    if (window.innerWidth <= 768 && targetVideo) {
                        // Remove any existing mobile video container
                        const existingMobileVideo = item.querySelector('.mobile-video-container');
                        if (existingMobileVideo) {
                            existingMobileVideo.remove();
                        }

                        // Create mobile video container
                        const mobileVideoContainer = document.createElement('div');
                        mobileVideoContainer.className = 'mobile-video-container';
                        mobileVideoContainer.innerHTML = `
                            <div class="mobile-video-wrapper">
                                <video controls>
                                    <source src="${targetVideo.querySelector('source').src}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        `;

                        // Prevent video clicks from bubbling up to the method item
                        mobileVideoContainer.addEventListener('click', function(e) {
                            e.stopPropagation();
                        });

                        // Insert after the method item
                        item.appendChild(mobileVideoContainer);
                    }
                }
            } else {
                // Show default visual when nothing is expanded
                const defaultVisual = document.querySelector('[data-method="default"]');
                if (defaultVisual) {
                    defaultVisual.classList.add('active');
                }

                // Remove mobile video container when collapsing
                const existingMobileVideo = item.querySelector('.mobile-video-container');
                if (existingMobileVideo) {
                    existingMobileVideo.remove();
                }
            }
        });
    });

    // Smooth scrolling for internal links
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Video handling for ad-hoc section
    const adhocVideo = document.querySelector('[data-problem="adhoc"] video');
    if (adhocVideo) {
        adhocVideo.addEventListener('loadstart', function() {
            console.log('Video loading started');
        });

        adhocVideo.addEventListener('canplay', function() {
            console.log('Video can start playing');
            const loadingIndicator = this.parentNode.querySelector('.video-loading');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        });

        adhocVideo.addEventListener('error', function(e) {
            console.log('Video error:', e);
            // Show fallback content
            const fallback = this.parentNode.querySelector('.video-fallback');
            if (fallback) {
                fallback.style.display = 'block';
            }
            this.style.display = 'none';
        });
    }

    // Case study expandable functionality with stats switching
    const caseStudyItems = document.querySelectorAll('.case-study[data-expandable]');
    const statsDisplays = document.querySelectorAll('.metric-display');

    caseStudyItems.forEach(function(item) {
        item.addEventListener('click', function() {
            const caseType = this.getAttribute('data-expandable');
            const statsType = this.getAttribute('data-stats');

            // Toggle expanded class
            item.classList.toggle('expanded');

            // Close other expanded case studies
            caseStudyItems.forEach(function(otherItem) {
                if (otherItem !== item) {
                    otherItem.classList.remove('expanded');
                }
            });

            // Update stats display
            statsDisplays.forEach(function(display) {
                display.classList.remove('active');
            });

            if (item.classList.contains('expanded')) {
                // Show corresponding stats
                const targetStats = document.querySelector(`[data-stats="${statsType}"]`);
                if (targetStats) {
                    targetStats.classList.add('active');
                }
            } else {
                // Return to default stats when nothing is expanded
                const defaultStats = document.querySelector('[data-stats="default"]');
                if (defaultStats) {
                    defaultStats.classList.add('active');
                }
            }
        });
    });

    // Contact form -> Cloudflare receiver Worker -> HaloPSA
    const LEAD_WORKER_URL = 'https://ripeda-website-lead-receiver.wandering-silence-da5d.workers.dev';

    document.querySelectorAll('.engineering-consultation-form').forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;

            // Turnstile injects a hidden input named "cf-turnstile-response"
            const tokenField = form.querySelector('[name="cf-turnstile-response"]');
            const token = tokenField ? tokenField.value : '';
            if (!token) {
                submitButton.textContent = 'Please complete the verification';
                setTimeout(function () { submitButton.textContent = originalText; }, 3000);
                return;
            }

            const fd = new FormData(form);
            const newsletterEl = form.querySelector('[name="newsletter_opt_in"]');
            const payload = {
                turnstile_token: token,
                website: fd.get('website') || '',            // honeypot
                first_name: fd.get('first_name') || '',
                last_name: fd.get('last_name') || '',
                email: fd.get('email') || '',
                phone: fd.get('phone') || '',
                company: fd.get('company') || '',
                job_title: fd.get('job_title') || '',
                company_size: fd.get('company_size') || '',
                industry: fd.get('industry') || '',
                current_challenge: fd.get('current_challenge') || '',
                device_count: fd.get('device_count') || '',
                additional_info: fd.get('additional_info') || '',
                inquiry_type: fd.getAll('inquiry_type'),      // checkboxes -> array
                newsletter_opt_in: newsletterEl ? newsletterEl.checked : false
            };

            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            fetch(LEAD_WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(function (res) {
                return res.json().catch(function () { return {}; })
                    .then(function (body) { return { ok: res.ok, body: body }; });
            })
            .then(function (r) {
                if (r.ok && r.body && r.body.success) {
                    form.innerHTML = '<div class="form-success"><h4>Thank you!</h4>' +
                        '<p>Your request has been received. We\'ll be in touch by the next business day.</p></div>';
                } else {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    if (window.turnstile) { window.turnstile.reset(); }
                    alert('Sorry, something went wrong sending your request. Please try again, or call us at 1-844-4-RIPEDA.');
                }
            })
            .catch(function () {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                if (window.turnstile) { window.turnstile.reset(); }
                alert('Sorry, something went wrong sending your request. Please try again, or call us at 1-844-4-RIPEDA.');
            });
        });
    });
});
