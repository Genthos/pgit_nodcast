// FILE_LOCATION= ellipse://pgit_nodcast/js/site.js

class NodcastSite {
    constructor() {
        this.data = null;
        this.currentCategory = null;
    }

    async loadData() {
        try {
            const response = await fetch('./data/episodes.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            return this.data;
        } catch (error) {
            console.error('Failed to load episode data:', error);
            // Fallback content
            this.data = {
                podcast: {
                    title: "Nodcast",
                    tagline: "Evidence-Based Relaxation for Better Sleep",
                    description: "Content temporarily unavailable. Please check back soon.",
                    rss_feed: "nodcast_rss/feed.xml",
                    contact_email: "contact@nodcast.com"
                },
                categories: {},
                episodes: []
            };
            return this.data;
        }
    }

    generateHeader(currentPage = 'home', categoryTitle = null) {
        const { podcast } = this.data;
        const breadcrumb = this.generateBreadcrumb(currentPage, categoryTitle);
        const navigation = this.generateNavigation(currentPage);

        return `
            <header>
                <div class="container">
                    <div class="header-content">
                        <div class="logo-section">
                            <div class="podcast-artwork">NC</div>
                            <div class="title-section">
                                <h1>${podcast.title}</h1>
                                ${breadcrumb}
                            </div>
                        </div>
                        ${navigation}
                    </div>
                </div>
            </header>
        `;
    }

    generateBreadcrumb(currentPage, categoryTitle) {
        if (currentPage === 'home') {
            return `<p class="tagline">${this.data.podcast.tagline}</p>`;
        } else {
            return `
                <div class="breadcrumb">
                    <a href="index.html">Home</a> → ${categoryTitle || 'Category'}
                </div>
            `;
        }
    }

    generateNavigation(currentPage) {
        const { podcast, categories } = this.data;
        
        if (currentPage === 'home') {
            return `
                <div class="subscribe-section">
                    <a href="${podcast.rss_feed}" class="rss-button">
                        <svg class="rss-icon" viewBox="0 0 24 24">
                            <path d="M6.503 20.752c0 1.794-1.456 3.248-3.251 3.248-1.796 0-3.252-1.454-3.252-3.248 0-1.794 1.456-3.248 3.252-3.248 1.795.001 3.251 1.454 3.251 3.248zm-6.503-12.572v4.811c6.05.062 10.96 4.966 11.022 11.009h4.817c-.062-8.71-7.118-15.758-15.839-15.82zm0-3.368c10.58.046 19.152 8.594 19.183 19.188h4.817c-.03-13.231-10.755-23.954-24-24v4.812z"/>
                        </svg>
                        Subscribe RSS
                    </a>
                </div>
            `;
        } else {
            const categoryLinks = Object.keys(categories)
                .filter(key => key !== currentPage)
                .map(key => `<a href="${key}.html">${categories[key].title}</a>`)
                .join('');
            
            return `
                <div class="nav-links">
                    <a href="index.html">Home</a>
                    ${categoryLinks}
                    <a href="${podcast.rss_feed}">RSS</a>
                </div>
            `;
        }
    }

    generateFooter() {
        const { podcast } = this.data;
        return `
            <footer>
                <div class="container">
                    <div class="footer-content">
                        <div>
                            <p>&copy; 2024 ${podcast.title} Podcast. Content for educational and relaxation purposes.</p>
                        </div>
                        <div class="social-links">
                            <a href="${podcast.rss_feed}">RSS Feed</a>
                            <a href="mailto:${podcast.contact_email}">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }

    generateAudioPlayer(audioFile) {
        return `
            <div class="episode-actions">
                <audio controls class="audio-player">
                    <source src="${audioFile}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            </div>
        `;
    }

    generateEpisodeCard(episode, categoryColor) {
        const techniqueDetailsSection = episode.technique_details ? this.generateTechniqueDetailsSection(episode.technique_details) : '';

        return `
            <div class="episode-card">
                <div class="episode-header">
                    <div class="episode-number" style="background: ${categoryColor}">${episode.episode_number}</div>
                    <div class="episode-title">${episode.title}</div>
                </div>
                <div class="episode-meta">
                    <span><strong>Duration:</strong> ${episode.duration}</span>
                    <span><strong>Format:</strong> ${episode.format}</span>
                    <span><strong>Focus:</strong> ${episode.focus}</span>
                </div>
                <div class="episode-description">
                    ${episode.description}
                </div>
                ${techniqueDetailsSection}
                ${this.generateAudioPlayer(episode.audio_file)}
            </div>
        `;
    }

    generateTechniqueDetailsSection(details) {
        const detailCards = Object.entries(details).map(([label, value]) => `
            <div class="technique-item">
                <div class="technique-label">${this.formatLabel(label)}</div>
                <div class="technique-value">${value}</div>
            </div>
        `).join('');

        return `
            <div class="technique-details">
                <h4>Technique Details:</h4>
                <div class="details-grid">
                    ${detailCards}
                </div>
            </div>
        `;
    }

    formatLabel(label) {
        return label.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    generateHomepage() {
        const { podcast, categories, episodes } = this.data;
        
        const categoryCards = Object.entries(categories).map(([key, category]) => {
            const categoryEpisodes = episodes.filter(ep => ep.category === key);
            const avgDuration = this.calculateAverageDuration(categoryEpisodes);
            
            return `
                <a href="${key}.html" class="category-card">
                    <div class="category-icon">${category.icon}</div>
                    <div class="category-title">${category.title}</div>
                    <div class="category-description">${category.description}</div>
                    <div class="category-stats">
                        <span class="episode-count">${categoryEpisodes.length} Session${categoryEpisodes.length !== 1 ? 's' : ''}</span>
                        <span>${avgDuration} avg</span>
                    </div>
                </a>
            `;
        }).join('');

        const totalMinutes = this.calculateTotalMinutes(episodes);
        const uniqueTechniques = this.countUniqueTechniques(episodes);

        return `
            <div class="container">
                <main>
                    <section class="about-section">
                        <h2>About ${podcast.title}</h2>
                        <p>${podcast.description}</p>
                    </section>

                    <section class="categories-section">
                        <h2>Browse Relaxation Sessions</h2>
                        <div class="categories-grid">
                            ${categoryCards}
                        </div>
                    </section>

                    <section class="stats-section">
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-number">${episodes.length}</span>
                                <div class="stat-label">Guided Sessions</div>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${totalMinutes}</span>
                                <div class="stat-label">Minutes of Content</div>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${uniqueTechniques}</span>
                                <div class="stat-label">Evidence-Based Techniques</div>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">100%</span>
                                <div class="stat-label">Research-Backed</div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        `;
    }

    generateCategoryPage(categoryKey) {
        const { categories, episodes } = this.data;
        const category = categories[categoryKey];
        const categoryEpisodes = episodes.filter(ep => ep.category === categoryKey);

        const episodeCards = categoryEpisodes.map(episode => 
            this.generateEpisodeCard(episode, category.color)
        ).join('');

        return `
            <div class="container">
                <main>
                    <section class="category-header" style="background: linear-gradient(135deg, ${category.color} 0%, ${this.lightenColor(category.color, 20)} 100%)">
                        <div class="category-icon">${category.icon}</div>
                        <h2>${category.title}</h2>
                        <p class="category-description">${category.description}</p>
                    </section>

                    <section class="episodes-section">
                        ${episodeCards}
                    </section>
                </main>
            </div>
        `;
    }

    calculateAverageDuration(episodes) {
        if (episodes.length === 0) return '0 min';
        
        const totalMinutes = episodes.reduce((sum, ep) => {
            const minutes = parseInt(ep.duration.match(/\d+/)[0]);
            return sum + minutes;
        }, 0);
        
        const avg = Math.round(totalMinutes / episodes.length);
        return `${avg} min`;
    }

    calculateTotalMinutes(episodes) {
        return episodes.reduce((sum, ep) => {
            const minutes = parseInt(ep.duration.match(/\d+/)[0]);
            return sum + minutes;
        }, 0);
    }

    countUniqueTechniques(episodes) {
        const techniques = new Set();
        episodes.forEach(ep => {
            if (ep.technique_details && ep.technique_details.method) {
                techniques.add(ep.technique_details.method);
            }
        });
        return techniques.size || episodes.length;
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    setupAudioPlayers() {
        document.addEventListener('DOMContentLoaded', () => {
            const audioPlayers = document.querySelectorAll('.audio-player');
            audioPlayers.forEach(player => {
                player.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    return false;
                });
            });
        });
    }

    async init(pageType = 'home', categoryKey = null) {
        await this.loadData();
        if (!this.data || !this.data.episodes) {
            // Return minimal fallback content
            return {
                header: '<header><div class="container"><h1>Nodcast</h1></div></header>',
                main: '<main><div class="container"><p>Content loading failed. Please refresh the page.</p></div></main>',
                footer: '<footer><div class="container"><p>Nodcast Podcast</p></div></footer>'
            };
        }

        this.setupAudioPlayers();

        if (pageType === 'home') {
            return {
                header: this.generateHeader('home'),
                main: this.generateHomepage(),
                footer: this.generateFooter()
            };
        } else if (pageType === 'category' && categoryKey) {
            const category = this.data.categories[categoryKey];
            if (!category) {
                // Category not found, redirect to home
                window.location.href = 'index.html';
                return null;
            }
            return {
                header: this.generateHeader(categoryKey, category.title),
                main: this.generateCategoryPage(categoryKey),
                footer: this.generateFooter()
            };
        }
    }
}

// Global site instance
window.nodcastSite = new NodcastSite();