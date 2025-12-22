class RosaryApp {
    constructor() {
        this.currentMystery = null;
        this.currentStep = 0;
        this.steps = [];
        this.focusedMysteryIndex = null;
        this.justSwitchedToOverview = false;
        this.init();
    }

    init() {
        this.renderHomeScreen();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('start-prayer-btn').addEventListener('click', () => {
            this.startPrayer();
        });

        // Mobile overview navigation button
        document.getElementById('mobile-start-prayer-btn').addEventListener('click', () => {
            this.startPrayer();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('back-btn').addEventListener('click', () => {
            this.previousStep();
        });

        // Mobile navigation buttons
        document.getElementById('mobile-next-btn').addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('mobile-back-btn').addEventListener('click', () => {
            this.previousStep();
        });

        document.getElementById('header-home-btn').addEventListener('click', () => {
            this.goToHome();
        });

        // Swipe gesture navigation for mobile
        this.setupSwipeGestures();

        // Arrow key navigation
        document.addEventListener('keydown', (e) => {
            const activeScreen = document.querySelector('.screen.active');
            
            // Escape key returns to home from any screen
            if (e.key === 'Escape') {
                e.preventDefault();
                if (activeScreen && activeScreen.id !== 'home-screen') {
                    this.goToHome();
                }
                return;
            }
            
            if (activeScreen && activeScreen.id === 'home-screen') {
                // Home screen keyboard navigation
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigateMysteries(e.key);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    const mysteryKeys = Object.keys(MYSTERIES);
                    if (this.focusedMysteryIndex !== null && this.focusedMysteryIndex < mysteryKeys.length) {
                        this.selectMystery(mysteryKeys[this.focusedMysteryIndex]);
                    }
                }
            } else if (activeScreen && activeScreen.id !== 'home-screen') {
                // Other screens keyboard navigation
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    if (activeScreen.id === 'prayer-screen') {
                        this.previousStep();
                    } else if (activeScreen.id === 'overview-screen') {
                        this.goToHome();
                    }
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (activeScreen.id === 'prayer-screen') {
                        this.nextStep();
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (activeScreen.id === 'overview-screen' && !this.justSwitchedToOverview) {
                        this.startPrayer();
                    }
                }
            }
        });
    }

    getTodayMystery() {
        const day = new Date().getDay();
        return MYSTERY_DAYS[day];
    }

    renderHomeScreen() {
        // Update header title
        document.getElementById('header-title').textContent = 'Scriptural Rosary';
        
        const mysteryList = document.getElementById('mystery-list');
        mysteryList.innerHTML = '';
        
        const todayMystery = this.getTodayMystery();
        const mysteryKeys = Object.keys(MYSTERIES);
        
        // Set initial focus to today's mystery, or first mystery if none
        if (this.focusedMysteryIndex === null) {
            const todayIndex = mysteryKeys.findIndex(key => key === todayMystery);
            this.focusedMysteryIndex = todayIndex >= 0 ? todayIndex : 0;
        }

        mysteryKeys.forEach((key, index) => {
            const mystery = MYSTERIES[key];
            const card = document.createElement('div');
            card.className = `mystery-card ${key === todayMystery ? 'today' : ''} ${index === this.focusedMysteryIndex ? 'focused' : ''}`;
            card.setAttribute('data-mystery-key', key);
            card.setAttribute('data-mystery-index', index);
            card.setAttribute('tabindex', '0');
            
            // Use single art URL
            const artUrl = mystery.artUrl || '';
            const artImage = artUrl ? 
                `<img src="${artUrl}" alt="${mystery.name}" class="mystery-art" onerror="this.style.display='none'" loading="lazy">` : 
                '';
            
            card.innerHTML = `
                <div class="mystery-art-gallery">
                    ${artImage}
                </div>
                <h3>${mystery.name}</h3>
                <p>Pray the ${mystery.name.toLowerCase()} with scriptural meditations</p>
            `;
            
            card.addEventListener('click', () => {
                this.selectMystery(key);
            });
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectMystery(key);
                }
            });
            
            mysteryList.appendChild(card);
        });
        
        // Focus the currently focused card (with Safari compatibility)
        const focusedCard = mysteryList.querySelector(`[data-mystery-index="${this.focusedMysteryIndex}"]`);
        if (focusedCard) {
            // Use setTimeout for Safari compatibility
            setTimeout(() => {
                focusedCard.focus();
            }, 0);
        }
    }

    navigateMysteries(direction) {
        const mysteryKeys = Object.keys(MYSTERIES);
        const totalMysteries = mysteryKeys.length;
        
        if (this.focusedMysteryIndex === null) {
            this.focusedMysteryIndex = 0;
        }
        
        if (direction === 'ArrowRight' || direction === 'ArrowDown') {
            this.focusedMysteryIndex = (this.focusedMysteryIndex + 1) % totalMysteries;
        } else if (direction === 'ArrowLeft' || direction === 'ArrowUp') {
            this.focusedMysteryIndex = (this.focusedMysteryIndex - 1 + totalMysteries) % totalMysteries;
        }
        
        // Update focus visual
        const mysteryList = document.getElementById('mystery-list');
        const cards = mysteryList.querySelectorAll('.mystery-card');
        cards.forEach((card, index) => {
            if (index === this.focusedMysteryIndex) {
                card.classList.add('focused');
                // Use setTimeout for Safari compatibility
                setTimeout(() => {
                    card.focus();
                    // Scroll into view if needed
                    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 0);
            } else {
                card.classList.remove('focused');
            }
        });
    }

    selectMystery(mysteryKey) {
        this.currentMystery = MYSTERIES[mysteryKey];
        this.justSwitchedToOverview = true;
        this.showScreen('overview-screen');
        // Use setTimeout to ensure screen is visible before rendering
        setTimeout(() => {
            this.renderOverview();
            // Reset flag after a short delay to allow Enter key to work normally
            setTimeout(() => {
                this.justSwitchedToOverview = false;
            }, 100);
        }, 10);
    }

    renderOverview() {
        // Update header title
        document.getElementById('header-title').textContent = this.currentMystery.name;
        
        const overview = document.getElementById('rosary-overview');
        
        // Clear any existing content
        overview.innerHTML = '';
        
        // Display John Paul II summary if available
        if (this.currentMystery.jpiiSummary) {
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'jpii-summary';
            
            // Create heading
            const heading = document.createElement('h3');
            heading.textContent = 'Reflection by St. John Paul II';
            summaryDiv.appendChild(heading);
            
            // Create paragraphs from the text, preserving line breaks
            const paragraphs = this.currentMystery.jpiiSummary.split('\n\n');
            paragraphs.forEach(paragraph => {
                if (paragraph.trim()) {
                    const p = document.createElement('p');
                    p.textContent = paragraph.trim();
                    summaryDiv.appendChild(p);
                }
            });
            
            // Add source link
            const sourceP = document.createElement('p');
            sourceP.className = 'summary-source';
            const sourceLink = document.createElement('a');
            sourceLink.href = 'https://www.vatican.va/content/john-paul-ii/en/apost_letters/2002/documents/hf_jp-ii_apl_20021016_rosarium-virginis-mariae.html';
            sourceLink.target = '_blank';
            sourceLink.rel = 'noopener noreferrer';
            sourceLink.className = 'reference-link';
            sourceLink.textContent = 'Rosarium Virginis Mariae (2002)';
            sourceP.appendChild(sourceLink);
            summaryDiv.appendChild(sourceP);
            
            overview.appendChild(summaryDiv);
        }
    }

    buildSteps() {
        this.steps = [];

        // Opening: Crucifix (Creed)
        this.steps.push({
            type: 'crucifix',
            prayer: PRAYERS.creed,
            scripture: null
        });

        // Opening: Our Father
        this.steps.push({
            type: 'ourFather',
            prayer: PRAYERS.ourFather,
            scripture: null
        });

        // Opening: 3 Hail Marys with Pope's prayer intentions
        const currentPrayerIntention = getCurrentMonthPrayerIntention();
        for (let i = 0; i < 3; i++) {
            this.steps.push({
                type: 'hailMary',
                prayer: PRAYERS.hailMary,
                scripture: null,
                isOpeningHailMary: true, // Mark as opening Hail Mary
                prayerIntention: currentPrayerIntention // Add Pope's prayer intention
            });
        }

        // Opening: Glory Be (with Fatima Prayer)
        this.steps.push({
            type: 'gloryBe',
            prayer: PRAYERS.gloryBe,
            fatimaPrayer: PRAYERS.fatimaPrayer,
            scripture: null
        });

        // Each mystery
        this.currentMystery.mysteries.forEach((mystery, mysteryIndex) => {
            // Our Father
            this.steps.push({
                type: 'ourFather',
                prayer: PRAYERS.ourFather,
                scripture: null,
                mysteryIndex: mysteryIndex,
                mysteryName: mystery.name,
                johnPaulIIReflection: mystery.johnPaulIIReflection || null
            });

            // 10 Hail Marys with scripture
            for (let i = 0; i < 10; i++) {
                this.steps.push({
                    type: 'hailMary',
                    prayer: PRAYERS.hailMary,
                    scripture: mystery.scriptures && mystery.scriptures[i] ? mystery.scriptures[i] : null,
                    mysteryIndex: mysteryIndex,
                    mysteryName: mystery.name,
                    hailMaryNumber: i + 1
                });
            }

            // Glory Be (with Fatima Prayer for mysteries)
            this.steps.push({
                type: 'gloryBe',
                prayer: PRAYERS.gloryBe,
                fatimaPrayer: PRAYERS.fatimaPrayer,
                scripture: null,
                mysteryIndex: mysteryIndex,
                mysteryName: mystery.name
            });
        });

        // Hail Holy Queen
        this.steps.push({
            type: 'hailHolyQueen',
            prayer: PRAYERS.hailHolyQueen,
            scripture: null
        });
    }

    startPrayer() {
        this.buildSteps();
        this.currentStep = 0;
        this.showScreen('prayer-screen');
        this.renderPrayerStep();
    }

    createBibleGatewayLink(reference) {
        // Extract the reference (e.g., "Luke 1:26-27 (NRSV)" -> "Luke 1:26-27")
        // Handle references with or without version in parentheses
        let refText = reference.trim();
        let version = 'NRSV'; // Default version
        
        // Check if reference has version in parentheses
        const versionMatch = reference.match(/\(([^)]+)\)/);
        if (versionMatch) {
            version = versionMatch[1].trim();
            // Remove the version part from the reference text
            refText = reference.replace(/\s*\([^)]+\)\s*$/, '').trim();
        }
        
        // Create biblegateway.com URL
        // Format: https://www.biblegateway.com/passage/?search=BOOK+CHAPTER:VERSE&version=VERSION
        const encodedRef = encodeURIComponent(refText);
        const encodedVersion = encodeURIComponent(version);
        return `https://www.biblegateway.com/passage/?search=${encodedRef}&version=${encodedVersion}`;
    }

    renderPrayerStep() {
        const step = this.steps[this.currentStep];
        
        // Update mystery beads visualization
        this.renderMysteryBeads();

        // Update prayer content
        const text = document.getElementById('prayer-text');
        const prayerTypeHeading = document.getElementById('prayer-type-heading');
        const popePrayerIntention = document.getElementById('pope-prayer-intention');
        const popePrayerIntentionTitle = document.getElementById('pope-prayer-intention-title');
        const popePrayerIntentionText = document.getElementById('pope-prayer-intention-text');
        const gloryBeSection = document.getElementById('glory-be-section');
        const gloryBeTitle = document.getElementById('glory-be-title');
        const gloryBeText = document.getElementById('glory-be-text');
        const fatimaSection = document.getElementById('fatima-prayer-section');
        const fatimaTitle = document.getElementById('fatima-prayer-title');
        const fatimaText = document.getElementById('fatima-prayer-text');
        const johnPaulReflection = document.getElementById('john-paul-reflection');
        const johnPaulReference = document.getElementById('john-paul-reference');
        const quote = document.getElementById('scripture-quote');
        const reference = document.getElementById('scripture-reference');

        // Update header title
        if (step.mysteryName) {
            document.getElementById('header-title').textContent = step.mysteryName;
        } else {
            document.getElementById('header-title').textContent = step.prayer.title;
        }

        // Display secondary heading for Our Father or Hail Mary steps
        if (step.type === 'ourFather') {
            prayerTypeHeading.textContent = 'Our Father';
            prayerTypeHeading.classList.remove('hidden');
        } else if (step.type === 'hailMary') {
            prayerTypeHeading.textContent = 'Hail Mary';
            prayerTypeHeading.classList.remove('hidden');
        } else {
            prayerTypeHeading.classList.add('hidden');
        }

        // Display Pope's prayer intention for opening Hail Marys
        if (step.isOpeningHailMary && step.prayerIntention) {
            popePrayerIntentionTitle.textContent = step.prayerIntention.title;
            popePrayerIntentionText.textContent = step.prayerIntention.text;
            popePrayerIntention.classList.remove('hidden');
        } else {
            popePrayerIntention.classList.add('hidden');
        }

        // Display Glory Be with heading if it's a Glory Be step
        if (step.type === 'gloryBe') {
            gloryBeTitle.textContent = 'Glory Be';
            gloryBeText.textContent = step.prayer.text;
            gloryBeSection.classList.remove('hidden');
            text.textContent = ''; // Clear regular prayer text
        } else {
            gloryBeSection.classList.add('hidden');
            text.textContent = step.prayer.text;
        }
        
        // Display Fatima Prayer separately if present
        if (step.type === 'gloryBe' && step.fatimaPrayer) {
            fatimaTitle.textContent = step.fatimaPrayer.title;
            fatimaText.textContent = step.fatimaPrayer.text;
            fatimaSection.classList.remove('hidden');
        } else {
            fatimaSection.classList.add('hidden');
        }

        // Display John Paul II reflection for Our Father of each mystery
        if (step.johnPaulIIReflection && step.type === 'ourFather') {
            johnPaulReflection.textContent = step.johnPaulIIReflection;
            
            // Create reference link to Rosarium Virginis Mariae
            const jp2Link = document.createElement('a');
            jp2Link.href = 'https://www.vatican.va/content/john-paul-ii/en/apost_letters/2002/documents/hf_jp-ii_apl_20021016_rosarium-virginis-mariae.html';
            jp2Link.target = '_blank';
            jp2Link.rel = 'noopener noreferrer';
            jp2Link.textContent = 'St. John Paul II, Rosarium Virginis Mariae (2002)';
            jp2Link.className = 'reference-link';
            
            johnPaulReference.innerHTML = '';
            johnPaulReference.appendChild(jp2Link);
            johnPaulReflection.classList.remove('hidden');
            johnPaulReference.classList.remove('hidden');
        } else {
            johnPaulReflection.classList.add('hidden');
            johnPaulReference.classList.add('hidden');
        }

        if (step.scripture) {
            quote.textContent = step.scripture.quote;
            
            // Create hyperlink for reference
            const link = document.createElement('a');
            link.href = this.createBibleGatewayLink(step.scripture.reference);
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = step.scripture.reference;
            link.className = 'bible-reference-link';
            
            // Clear and add link
            reference.innerHTML = '';
            reference.appendChild(link);
            reference.classList.remove('hidden');
            quote.classList.remove('hidden');
        } else {
            quote.classList.add('hidden');
            reference.classList.add('hidden');
        }

        // Update buttons (desktop and mobile)
        const nextBtn = document.getElementById('next-btn');
        const backBtn = document.getElementById('back-btn');
        const mobileNextBtn = document.getElementById('mobile-next-btn');
        const mobileBackBtn = document.getElementById('mobile-back-btn');

        if (this.currentStep === 0) {
            backBtn.style.display = 'none';
            if (mobileBackBtn) mobileBackBtn.style.display = 'none';
        } else {
            backBtn.style.display = 'inline-block';
            if (mobileBackBtn) mobileBackBtn.style.display = 'inline-block';
        }

        const nextBtnText = this.currentStep === this.steps.length - 1 ? 'Return to Home' : 'Next';
        nextBtn.textContent = nextBtnText;
        if (mobileNextBtn) mobileNextBtn.textContent = nextBtnText;
    }

    renderMysteryBeads() {
        const beadsContainer = document.getElementById('mystery-beads');
        const mobileBeadsContainer = document.getElementById('mobile-mystery-beads');
        
        // Render to both desktop and mobile containers
        this.renderBeadsToContainer(beadsContainer);
        this.renderBeadsToContainer(mobileBeadsContainer);
    }
    
    renderBeadsToContainer(beadsContainer) {
        beadsContainer.innerHTML = '';
        
        const currentStep = this.steps[this.currentStep];
        
        // Hide during Apostles Creed, Glory Be, and final prayer
        if (currentStep.type === 'crucifix' || 
            currentStep.type === 'gloryBe' || 
            currentStep.type === 'hailHolyQueen') {
            beadsContainer.classList.add('hidden');
            return;
        }
        
        beadsContainer.classList.remove('hidden');
        
        // Check if we're in opening prayers (Our Father and 3 Hail Marys)
        const isInOpening = currentStep.mysteryIndex === undefined && 
                           (currentStep.type === 'ourFather' || currentStep.type === 'hailMary');
        
        if (isInOpening) {
            // Show opening prayers beads: 1 Our Father + 3 Hail Marys
            this.renderOpeningBeads(beadsContainer);
        } else if (currentStep.mysteryIndex !== undefined) {
            // Show mystery beads: 1 Our Father + 10 Hail Marys
            this.renderMysteryBeadsForMystery(beadsContainer, currentStep.mysteryIndex);
        } else {
            beadsContainer.classList.add('hidden');
        }
    }
    
    renderOpeningBeads(beadsContainer) {
        // Find opening Our Father and 3 Hail Marys
        let ourFatherStepIndex = -1;
        let hailMaryStepIndices = [];
        
        this.steps.forEach((step, index) => {
            if (step.mysteryIndex === undefined) {
                if (step.type === 'ourFather') {
                    ourFatherStepIndex = index;
                } else if (step.type === 'hailMary') {
                    hailMaryStepIndices.push(index);
                }
            }
        });
        
        // Sort Hail Mary indices to ensure correct order
        hailMaryStepIndices.sort((a, b) => a - b);
        
        // Create bead container
        const beadsWrapper = document.createElement('div');
        beadsWrapper.className = 'mystery-beads-wrapper';
        
        // Our Father bead
        if (ourFatherStepIndex >= 0) {
            const isCompleted = ourFatherStepIndex < this.currentStep;
            const isActive = ourFatherStepIndex === this.currentStep;
            const ourFatherBead = this.createMysteryBead(ourFatherStepIndex, 'ourFather', isCompleted, isActive);
            beadsWrapper.appendChild(ourFatherBead);
        }
        
        // Hail Mary beads (3 total for opening)
        for (let i = 0; i < 3; i++) {
            const hailMaryStepIndex = hailMaryStepIndices[i];
            if (hailMaryStepIndex !== undefined) {
                const isCompleted = hailMaryStepIndex < this.currentStep;
                const isActive = hailMaryStepIndex === this.currentStep;
                const hailMaryBead = this.createMysteryBead(hailMaryStepIndex, 'hailMary', isCompleted, isActive);
                beadsWrapper.appendChild(hailMaryBead);
            }
        }
        
        beadsContainer.appendChild(beadsWrapper);
    }
    
    renderMysteryBeadsForMystery(beadsContainer, mysteryIndex) {
        // Find the Our Father step and Hail Mary steps for this mystery
        let ourFatherStepIndex = -1;
        let hailMaryStepIndices = [];
        
        this.steps.forEach((step, index) => {
            if (step.mysteryIndex === mysteryIndex) {
                if (step.type === 'ourFather') {
                    ourFatherStepIndex = index;
                } else if (step.type === 'hailMary') {
                    hailMaryStepIndices.push(index);
                }
            }
        });
        
        // Sort Hail Mary indices to ensure correct order
        hailMaryStepIndices.sort((a, b) => a - b);
        
        // Create bead container
        const beadsWrapper = document.createElement('div');
        beadsWrapper.className = 'mystery-beads-wrapper';
        
        // Our Father bead
        if (ourFatherStepIndex >= 0) {
            const isCompleted = ourFatherStepIndex < this.currentStep;
            const isActive = ourFatherStepIndex === this.currentStep;
            const ourFatherBead = this.createMysteryBead(ourFatherStepIndex, 'ourFather', isCompleted, isActive);
            beadsWrapper.appendChild(ourFatherBead);
        }
        
        // Hail Mary beads (10 total)
        for (let i = 0; i < 10; i++) {
            const hailMaryStepIndex = hailMaryStepIndices[i];
            if (hailMaryStepIndex !== undefined) {
                const isCompleted = hailMaryStepIndex < this.currentStep;
                const isActive = hailMaryStepIndex === this.currentStep;
                const hailMaryBead = this.createMysteryBead(hailMaryStepIndex, 'hailMary', isCompleted, isActive);
                beadsWrapper.appendChild(hailMaryBead);
            }
        }
        
        beadsContainer.appendChild(beadsWrapper);
    }
    
    createMysteryBead(stepIndex, type, isCompleted, isActive = false) {
        const bead = document.createElement('div');
        bead.className = `mystery-bead ${type}`;
        bead.setAttribute('data-step-index', stepIndex);
        
        if (isCompleted) {
            bead.classList.add('completed');
        }
        if (isActive) {
            bead.classList.add('active');
        }
        
        // Add click event listener
        bead.addEventListener('click', () => {
            this.currentStep = stepIndex;
            this.renderPrayerStep();
        });
        
        return bead;
    }

    calculateRemaining() {
        const parts = [];
        const remainingSteps = this.steps.slice(this.currentStep + 1);
        
        if (remainingSteps.length === 0) {
            return { parts: [] };
        }

        const currentStep = this.steps[this.currentStep];
        const isInOpening = currentStep.mysteryIndex === undefined;

        if (isInOpening) {
            // Still in opening prayers - count what's left in opening + mysteries
            let ourFatherCount = 0;
            let hailMaryCount = 0;
            let mysteriesRemaining = 0;
            let seenMysteryIndices = new Set();

            remainingSteps.forEach(step => {
                if (step.mysteryIndex === undefined) {
                    // Still in opening
                    if (step.type === 'ourFather') {
                        ourFatherCount++;
                    } else if (step.type === 'hailMary') {
                        hailMaryCount++;
                    }
                } else {
                    // In mysteries - count unique mysteries
                    if (step.type === 'ourFather' && !seenMysteryIndices.has(step.mysteryIndex)) {
                        mysteriesRemaining++;
                        seenMysteryIndices.add(step.mysteryIndex);
                    }
                }
            });

            if (ourFatherCount > 0) {
                parts.push(`${ourFatherCount} Our Father${ourFatherCount > 1 ? 's' : ''}`);
            }
            if (hailMaryCount > 0) {
                parts.push(`${hailMaryCount} Hail Mary${hailMaryCount > 1 ? 's' : ''}`);
            }
            if (mysteriesRemaining > 0) {
                parts.push(`${mysteriesRemaining} Mysteries`);
            }
        } else {
            // In a mystery
            const currentMysteryIdx = currentStep.mysteryIndex;
            
            if (currentStep.type === 'ourFather') {
                // Just starting a mystery - count Hail Marys in this mystery + remaining mysteries
                let hailMaryCount = 0;
                let mysteriesRemaining = 0;
                let seenMysteryIndices = new Set();

                remainingSteps.forEach(step => {
                    if (step.mysteryIndex === currentMysteryIdx && step.type === 'hailMary') {
                        hailMaryCount++;
                    } else if (step.mysteryIndex !== undefined && step.mysteryIndex !== currentMysteryIdx) {
                        if (step.type === 'ourFather' && !seenMysteryIndices.has(step.mysteryIndex)) {
                            mysteriesRemaining++;
                            seenMysteryIndices.add(step.mysteryIndex);
                        }
                    }
                });

                if (hailMaryCount > 0) {
                    parts.push(`${hailMaryCount} Hail Mary${hailMaryCount > 1 ? 's' : ''}`);
                }
                if (mysteriesRemaining > 0) {
                    parts.push(`${mysteriesRemaining} Mysteries`);
                }
            } else if (currentStep.type === 'hailMary') {
                // In the middle of Hail Marys - count remaining in current mystery + remaining mysteries
                let currentMysteryHailMarys = 0;
                let mysteriesRemaining = 0;
                let seenMysteryIndices = new Set();

                remainingSteps.forEach(step => {
                    if (step.mysteryIndex === currentMysteryIdx && step.type === 'hailMary') {
                        currentMysteryHailMarys++;
                    } else if (step.mysteryIndex !== undefined && step.mysteryIndex !== currentMysteryIdx) {
                        if (step.type === 'ourFather' && !seenMysteryIndices.has(step.mysteryIndex)) {
                            mysteriesRemaining++;
                            seenMysteryIndices.add(step.mysteryIndex);
                        }
                    }
                });

                if (currentMysteryHailMarys > 0) {
                    parts.push(`${currentMysteryHailMarys} Hail Mary${currentMysteryHailMarys > 1 ? 's' : ''}`);
                }
                if (mysteriesRemaining > 0) {
                    parts.push(`${mysteriesRemaining} Mysteries`);
                }
            } else if (currentStep.type === 'gloryBe') {
                // At Glory Be - just show remaining mysteries
                let mysteriesRemaining = 0;
                let seenMysteryIndices = new Set();

                remainingSteps.forEach(step => {
                    if (step.mysteryIndex !== undefined && step.mysteryIndex !== currentMysteryIdx) {
                        if (step.type === 'ourFather' && !seenMysteryIndices.has(step.mysteryIndex)) {
                            mysteriesRemaining++;
                            seenMysteryIndices.add(step.mysteryIndex);
                        }
                    }
                });

                if (mysteriesRemaining > 0) {
                    parts.push(`${mysteriesRemaining} Mysteries`);
                }
            }
        }

        return { parts };
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.renderPrayerStep();
        } else {
            // Return to home
            this.currentStep = 0;
            this.steps = [];
            this.showScreen('home-screen');
            this.renderHomeScreen();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderPrayerStep();
        }
    }

    setupSwipeGestures() {
        const prayerScreen = document.getElementById('prayer-screen');
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        const minSwipeDistance = 50; // Minimum distance in pixels for a swipe

        prayerScreen.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        prayerScreen.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            // Only process swipe if horizontal movement is greater than vertical (horizontal swipe)
            // and the distance is greater than the minimum
            if (absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
                // Check if we're on the prayer screen
                const activeScreen = document.querySelector('.screen.active');
                if (activeScreen && activeScreen.id === 'prayer-screen') {
                    if (deltaX > 0) {
                        // Swipe right - go to previous step
                        this.previousStep();
                    } else {
                        // Swipe left - go to next step
                        this.nextStep();
                    }
                }
            }
        }, { passive: true });
    }

    goToHome() {
        this.currentStep = 0;
        this.steps = [];
        this.currentMystery = null;
        this.showScreen('home-screen');
        this.renderHomeScreen();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        
        // Update header title based on screen
        if (screenId === 'home-screen') {
            document.getElementById('header-title').textContent = 'Scriptural Rosary';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RosaryApp();
});

// Full screen support
document.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Error attempting to enable fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
});

