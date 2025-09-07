class PlantDiagnosis {
    constructor() {
        this.init();
    }

    init() {
        this.setupImageUpload();
        this.setupVoiceInput();
        this.setupForm();
    }

    setupImageUpload() {
        const imageUploadArea = document.getElementById('imageUploadArea');
        const imageInput = document.getElementById('imageInput');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        const removeImage = document.getElementById('removeImage');

        if (!imageUploadArea || !imageInput) return;

        // Click to upload
        imageUploadArea.addEventListener('click', () => {
            imageInput.click();
        });

        // Drag and drop with better visual feedback
        imageUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            imageUploadArea.style.borderColor = 'var(--primary-color)';
            imageUploadArea.style.background = 'rgba(16, 185, 129, 0.1)';
            imageUploadArea.style.transform = 'scale(1.02)';
        });

        imageUploadArea.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        imageUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Only reset if we're leaving the upload area completely
            if (!imageUploadArea.contains(e.relatedTarget)) {
                imageUploadArea.style.borderColor = 'var(--border-color)';
                imageUploadArea.style.background = 'transparent';
                imageUploadArea.style.transform = 'scale(1)';
            }
        });

        imageUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            imageUploadArea.style.borderColor = 'var(--border-color)';
            imageUploadArea.style.background = 'transparent';
            imageUploadArea.style.transform = 'scale(1)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageFile(files[0]);
            }
        });

        // File input change with better handling
        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleImageFile(e.target.files[0]);
            }
        });

        // Remove image
        if (removeImage) {
            removeImage.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearImage();
            });
        }

        // Add paste functionality for screenshots
        document.addEventListener('paste', (e) => {
            const items = e.clipboardData?.items;
            if (items) {
                for (let item of items) {
                    if (item.type.indexOf('image') !== -1) {
                        const file = item.getAsFile();
                        if (file) {
                            this.handleImageFile(file);
                            break;
                        }
                    }
                }
            }
        });
    }

    handleImageFile(file) {
        // Validate file type
        if (!this.isValidImageFile(file)) {
            window.rootIntelApp.showMessage('Please select a valid image file (PNG, JPG, WEBP, GIF)', 'error');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            window.rootIntelApp.showMessage('File size must be less than 5MB. Please choose a smaller image.', 'error');
            return;
        }

        // Show loading state
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        if (uploadPlaceholder) {
            uploadPlaceholder.innerHTML = '<div class="loader"></div><p>Processing image...</p>';
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
            const uploadPlaceholder = document.getElementById('uploadPlaceholder');
            const imagePreview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');

            if (uploadPlaceholder && imagePreview && previewImg) {
                previewImg.src = e.target.result;
                uploadPlaceholder.style.display = 'none';
                imagePreview.style.display = 'block';
                
                // Show success message
                window.rootIntelApp.showMessage('Image uploaded successfully!', 'success');
            }
        };

        reader.onerror = () => {
            window.rootIntelApp.showMessage('Failed to read image file. Please try again.', 'error');
            this.clearImage();
        };

        reader.readAsDataURL(file);

        // Update the file input
        const imageInput = document.getElementById('imageInput');
        if (imageInput) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            imageInput.files = dataTransfer.files;
        }
    }

    clearImage() {
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const imagePreview = document.getElementById('imagePreview');
        const imageInput = document.getElementById('imageInput');

        if (uploadPlaceholder && imagePreview && imageInput) {
            // Reset upload placeholder to original content
            uploadPlaceholder.innerHTML = `
                <span class="upload-icon">📸</span>
                <p class="upload-text">Click to upload or drag & drop</p>
                <p class="upload-hint">PNG, JPG, WEBP up to 5MB</p>
            `;
            uploadPlaceholder.style.display = 'flex';
            imagePreview.style.display = 'none';
            imageInput.value = '';
        }
    }

    isValidImageFile(file) {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
        return validTypes.includes(file.type);
    }

    setupVoiceInput() {
        const voiceBtn = document.getElementById('voiceBtn');
        const symptomsInput = document.getElementById('symptomsInput');
        const voiceStatus = document.getElementById('voiceStatus');

        if (!voiceBtn || !symptomsInput || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            if (voiceBtn) voiceBtn.style.display = 'none';
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        let isListening = false;

        voiceBtn.addEventListener('click', () => {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });

        recognition.onstart = () => {
            isListening = true;
            voiceBtn.style.background = 'var(--error-color)';
            voiceStatus.style.display = 'flex';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            symptomsInput.value += (symptomsInput.value ? ' ' : '') + transcript;
        };

        recognition.onend = () => {
            isListening = false;
            voiceBtn.style.background = 'var(--primary-color)';
            voiceStatus.style.display = 'none';
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            window.rootIntelApp.showMessage('Voice recognition failed. Please try again.', 'error');
            isListening = false;
            voiceBtn.style.background = 'var(--primary-color)';
            voiceStatus.style.display = 'none';
        };
    }

    setupForm() {
        const diagnosisForm = document.getElementById('diagnosisForm');
        const submitBtn = document.getElementById('submitBtn');
        const newDiagnosisBtn = document.getElementById('newDiagnosisBtn');
        const saveBtn = document.getElementById('saveBtn');

        if (diagnosisForm) {
            diagnosisForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitDiagnosis();
            });
        }

        if (newDiagnosisBtn) {
            newDiagnosisBtn.addEventListener('click', () => {
                this.resetForm();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveToJournal();
            });
        }
    }

    async submitDiagnosis() {
        const form = document.getElementById('diagnosisForm');
        const submitBtn = document.getElementById('submitBtn');
        const symptomsInput = document.getElementById('symptomsInput');
        const imageInput = document.getElementById('imageInput');
        const diagnosisResults = document.getElementById('diagnosisResults');
        const errorMessage = document.getElementById('errorMessage');

        if (!form || !submitBtn) return;

        const symptoms = symptomsInput ? symptomsInput.value.trim() : '';
        const hasImage = imageInput && imageInput.files.length > 0;

        // Check if at least one input is provided
        if (!symptoms && !hasImage) {
            window.rootIntelApp.showMessage('Please provide either an image or describe the symptoms', 'error');
            return;
        }

        try {
            window.RootIntelUtils.showLoader(submitBtn);

            const formData = new FormData(form);
            const response = await fetch('/api/analyze-plant', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                this.displayResults(data);
                if (diagnosisResults) {
                    diagnosisResults.style.display = 'block';
                    diagnosisResults.scrollIntoView({ behavior: 'smooth' });
                }
                window.rootIntelApp.showMessage('Plant diagnosis completed successfully!', 'success');
            } else {
                throw new Error(data.error || 'Diagnosis failed');
            }

        } catch (error) {
            console.error('Diagnosis error:', error);
            if (errorMessage) {
                errorMessage.querySelector('.error-text').textContent = error.message;
                errorMessage.style.display = 'flex';
            }
            window.rootIntelApp.showMessage('Diagnosis failed. Please try again.', 'error');
        } finally {
            window.RootIntelUtils.hideLoader(submitBtn);
        }
    }

    displayResults(data) {
        const resultsContainer = document.getElementById('diagnosisResults');
        if (!resultsContainer) return;
        
        // Clear previous results
        resultsContainer.innerHTML = '';
        
        // Create results structure
        let resultsHTML = `
            <div class="results-card">
                <div class="results-header">
                    <h2 class="results-title">
                        <span class="results-icon">🏥</span>
                        Diagnosis Results
                    </h2>
                </div>
        `;
        
        // Image Analysis Results
        if (data.image_analysis && data.image_analysis.success) {
            const imageAnalysis = data.image_analysis;
            resultsHTML += `
                <div class="analysis-section image-analysis">
                    <div class="section-header">
                        <h3 class="section-title">
                            <span class="section-icon">📷</span>
                            Image-Based AI Analysis
                        </h3>
                        <div class="confidence-badge" style="background: ${this.getConfidenceColor(imageAnalysis.confidence)};">
                            <span>${imageAnalysis.confidence}</span>% Confidence
                        </div>
                    </div>
                    
                    <div class="ai-status">
                        <span class="ai-icon">🤖</span>
                        <span class="ai-text">${this.getAIMethodText(imageAnalysis.method)}</span>
                    </div>
                    
                    <div class="analysis-content">
                        <div class="diagnosis-info">
                            <h4 class="diagnosis-name">${imageAnalysis.name}</h4>
                            <p class="diagnosis-description">${imageAnalysis.diagnosis}</p>
                        </div>
                        
                        <div class="treatment-section">
                            <h5 class="subsection-title">
                                <span class="subsection-icon">💊</span>
                                Treatment Plan
                            </h5>
                            <ul class="treatment-list">
                                ${imageAnalysis.treatment.map(treatment => `<li>${treatment}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="prevention-section">
                            <h5 class="subsection-title">
                                <span class="subsection-icon">🛡️</span>
                                Prevention Tips
                            </h5>
                            <ul class="prevention-list">
                                ${imageAnalysis.prevention.map(prevention => `<li>${prevention}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        } else if (data.image_analysis && !data.image_analysis.success) {
            resultsHTML += `
                <div class="analysis-section image-analysis error">
                    <div class="section-header">
                        <h3 class="section-title">
                            <span class="section-icon">📷</span>
                            Image Analysis
                        </h3>
                    </div>
                    <div class="error-message">
                        <span class="error-icon">⚠️</span>
                        <span class="error-text">${data.image_analysis.error}</span>
                    </div>
                </div>
            `;
        }
        
        // Symptom Analysis Results
        if (data.symptom_analysis && data.symptom_analysis.success) {
            const symptomAnalysis = data.symptom_analysis;
            resultsHTML += `
                <div class="analysis-section symptom-analysis">
                    <div class="section-header">
                        <h3 class="section-title">
                            <span class="section-icon">📝</span>
                            Symptom-Based Analysis
                        </h3>
                        <div class="confidence-badge" style="background: ${this.getConfidenceColor(symptomAnalysis.confidence)};">
                            <span>${symptomAnalysis.confidence}</span>% Confidence
                        </div>
                    </div>
                    
                    <div class="analysis-content">
                        <div class="diagnosis-info">
                            <h4 class="diagnosis-name">${symptomAnalysis.name}</h4>
                            <p class="diagnosis-description">${symptomAnalysis.diagnosis}</p>
                        </div>
                        
                        <div class="treatment-section">
                            <h5 class="subsection-title">
                                <span class="subsection-icon">💊</span>
                                Treatment Plan
                            </h5>
                            <ul class="treatment-list">
                                ${symptomAnalysis.treatment.map(treatment => `<li>${treatment}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="prevention-section">
                            <h5 class="subsection-title">
                                <span class="subsection-icon">🛡️</span>
                                Prevention Tips
                            </h5>
                            <ul class="prevention-list">
                                ${symptomAnalysis.prevention.map(prevention => `<li>${prevention}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // No analysis results
        if ((!data.image_analysis || !data.image_analysis.success) && 
            (!data.symptom_analysis || !data.symptom_analysis.success)) {
            resultsHTML += `
                <div class="analysis-section no-results">
                    <div class="section-header">
                        <h3 class="section-title">
                            <span class="section-icon">❓</span>
                            No Analysis Results
                        </h3>
                    </div>
                    <div class="no-results-message">
                        <p>Please provide either an image or describe the symptoms to get analysis results.</p>
                    </div>
                </div>
            `;
        }
        
        // Action buttons
        resultsHTML += `
                <div class="results-actions">
                    <button class="action-btn secondary" id="saveBtn">
                        <span class="btn-icon">💾</span>
                        Save to Journal
                    </button>
                    <button class="action-btn primary" id="newDiagnosisBtn">
                        <span class="btn-icon">🔍</span>
                        New Diagnosis
                    </button>
                </div>
            </div>
        `;
        
        // Set the results HTML
        resultsContainer.innerHTML = resultsHTML;
        resultsContainer.style.display = 'block';
        
        // Re-attach event listeners
        this.attachResultEventListeners();
        
        // Store current diagnosis for saving to journal
        this.currentDiagnosis = data;
    }
    
    getConfidenceColor(confidence) {
        if (confidence >= 80) {
            return 'var(--success-color)';
        } else if (confidence >= 60) {
            return 'var(--warning-color)';
        } else {
            return 'var(--error-color)';
        }
    }
    
    getAIMethodText(method) {
        switch(method) {
            case 'tensorflow':
                return 'AI-Powered Analysis (Trained Model)';
            case 'rule_based':
                return 'AI-Powered Analysis (Rule-Based)';
            case 'symptom_based':
                return 'Symptom-Based Analysis';
            default:
                return 'AI-Powered Analysis';
        }
    }
    
    attachResultEventListeners() {
        const newDiagnosisBtn = document.getElementById('newDiagnosisBtn');
        const saveBtn = document.getElementById('saveBtn');
        
        if (newDiagnosisBtn) {
            newDiagnosisBtn.addEventListener('click', () => {
                this.resetForm();
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveToJournal();
            });
        }
    }

    resetForm() {
        const form = document.getElementById('diagnosisForm');
        const diagnosisResults = document.getElementById('diagnosisResults');
        const errorMessage = document.getElementById('errorMessage');

        if (form) form.reset();
        this.clearImage();
        
        if (diagnosisResults) diagnosisResults.style.display = 'none';
        if (errorMessage) errorMessage.style.display = 'none';
    }

    async saveToJournal() {
        if (!this.currentDiagnosis) {
            window.rootIntelApp.showMessage('No diagnosis to save', 'error');
            return;
        }

        try {
            const entry = {
                hypothesis: `Plant shows symptoms of ${this.currentDiagnosis.diagnosis.name}`,
                action: 'Applied AI diagnosis',
                result: `Diagnosis: ${this.currentDiagnosis.diagnosis.diagnosis} (${this.currentDiagnosis.diagnosis.confidence}% confidence)`,
                reflection: 'AI-powered diagnosis provided treatment recommendations',
                tags: ['ai-diagnosis', 'plant-health', 'treatment']
            };

            const response = await fetch('/api/add-journal-entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(entry)
            });

            const data = await response.json();

            if (data.success) {
                window.rootIntelApp.showMessage('Diagnosis saved to journal successfully!', 'success');
            } else {
                throw new Error(data.error || 'Failed to save to journal');
            }

        } catch (error) {
            console.error('Save to journal error:', error);
            window.rootIntelApp.showMessage('Failed to save to journal. Please try again.', 'error');
        }
    }
}

// Initialize the diagnosis functionality
document.addEventListener('DOMContentLoaded', () => {
    new PlantDiagnosis();
});
