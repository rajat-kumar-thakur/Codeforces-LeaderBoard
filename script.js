// Configuration - Update these values with your Google Sheets details
const CONFIG = {
    // Google Sheets Configuration
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID', // Replace with your Google Spreadsheet ID
    RANGE: 'Sheet1!A:B', // Adjust range based on your sheet structure (Column A: usernames, Column B: optional additional info)
    API_KEY: 'YOUR_GOOGLE_API_KEY', // Replace with your Google API key
    
    // Codeforces API Configuration
    CODEFORCES_API_BASE: 'https://codeforces.com/api',
    
    // Update interval (in milliseconds)
    UPDATE_INTERVAL: 300000, // 5 minutes
};

class CodeforcesLeaderboard {
    constructor() {
        this.users = [];
        this.leaderboardData = [];
        this.isLoading = false;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadGoogleSheetsData();
        await this.updateLeaderboard();
        
        // Set up auto-refresh
        setInterval(() => {
            this.updateLeaderboard();
        }, CONFIG.UPDATE_INTERVAL);
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        const ratingFilter = document.getElementById('ratingFilter');
        
        refreshBtn.addEventListener('click', () => {
            this.updateLeaderboard();
        });
        
        ratingFilter.addEventListener('change', (e) => {
            this.filterLeaderboard(e.target.value);
        });
    }

    async loadGoogleSheetsData() {
        try {
            this.showLoading(true);
            this.hideError();
            
            // Load Google Sheets API
            await this.loadGoogleAPI();
            
            // Fetch data from Google Sheets
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: CONFIG.SPREADSHEET_ID,
                range: CONFIG.RANGE,
            });
            
            const rows = response.result.values;
            if (!rows || rows.length === 0) {
                throw new Error('No data found in the spreadsheet');
            }
            
            // Parse usernames from the first column
            this.users = rows.slice(1).map(row => row[0]).filter(username => username && username.trim());
            
            console.log(`Loaded ${this.users.length} users from Google Sheets`);
            
        } catch (error) {
            console.error('Error loading Google Sheets data:', error);
            this.showError(`Failed to load data from Google Sheets: ${error.message}`);
            
            // Fallback to sample data for demonstration
            this.users = ['tourist', 'Petr', 'Egor', 'rng_58', 'ACRush'];
            console.log('Using fallback sample data');
        } finally {
            this.showLoading(false);
        }
    }

    async loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        apiKey: CONFIG.API_KEY,
                        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                    });
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    async updateLeaderboard() {
        if (this.isLoading) return;
        
        try {
            this.isLoading = true;
            this.showLoading(true);
            this.hideError();
            
            // Fetch user info from Codeforces API
            const userInfoPromises = this.users.map(username => 
                this.fetchCodeforcesUserInfo(username)
            );
            
            const userInfos = await Promise.allSettled(userInfoPromises);
            
            // Process successful responses
            this.leaderboardData = userInfos
                .filter(result => result.status === 'fulfilled' && result.value)
                .map(result => result.value)
                .sort((a, b) => b.rating - a.rating);
            
            this.renderLeaderboard();
            this.updateStats();
            
        } catch (error) {
            console.error('Error updating leaderboard:', error);
            this.showError(`Failed to update leaderboard: ${error.message}`);
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    async fetchCodeforcesUserInfo(username) {
        try {
            const response = await fetch(`${CONFIG.CODEFORCES_API_BASE}/user.info?handles=${username}`);
            const data = await response.json();
            
            if (data.status !== 'OK' || !data.result || data.result.length === 0) {
                throw new Error(`User ${username} not found`);
            }
            
            const user = data.result[0];
            
            // Fetch user rating history for change calculation
            const ratingResponse = await fetch(`${CONFIG.CODEFORCES_API_BASE}/user.rating?handle=${username}`);
            const ratingData = await ratingResponse.json();
            
            let ratingChange = 0;
            if (ratingData.status === 'OK' && ratingData.result && ratingData.result.length > 0) {
                const lastContest = ratingData.result[ratingData.result.length - 1];
                ratingChange = lastContest.newRating - lastContest.oldRating;
            }
            
            return {
                username: user.handle,
                rating: user.rating || 0,
                maxRating: user.maxRating || 0,
                rank: user.rank || 'unrated',
                titlePhoto: user.titlePhoto,
                ratingChange: ratingChange,
                contestCount: ratingData.status === 'OK' ? ratingData.result.length : 0,
                lastOnlineTime: user.lastOnlineTimeSeconds
            };
            
        } catch (error) {
            console.error(`Error fetching data for ${username}:`, error);
            return null;
        }
    }

    getRatingClass(rating) {
        if (rating >= 3000) return 'legendary-grandmaster';
        if (rating >= 2600) return 'international-grandmaster';
        if (rating >= 2400) return 'grandmaster';
        if (rating >= 2300) return 'international-master';
        if (rating >= 2100) return 'master';
        if (rating >= 1900) return 'candidate-master';
        if (rating >= 1600) return 'expert';
        if (rating >= 1400) return 'specialist';
        if (rating >= 1200) return 'pupil';
        return 'newbie';
    }

    getRatingTitle(rating) {
        if (rating >= 3000) return 'Legendary Grandmaster';
        if (rating >= 2600) return 'International Grandmaster';
        if (rating >= 2400) return 'Grandmaster';
        if (rating >= 2300) return 'International Master';
        if (rating >= 2100) return 'Master';
        if (rating >= 1900) return 'Candidate Master';
        if (rating >= 1600) return 'Expert';
        if (rating >= 1400) return 'Specialist';
        if (rating >= 1200) return 'Pupil';
        return 'Newbie';
    }

    formatChange(change) {
        if (change > 0) return `+${change}`;
        if (change < 0) return change.toString();
        return '0';
    }

    getChangeClass(change) {
        if (change > 0) return 'positive';
        if (change < 0) return 'negative';
        return 'neutral';
    }

    renderLeaderboard() {
        const leaderboard = document.getElementById('leaderboard');
        
        if (this.leaderboardData.length === 0) {
            leaderboard.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No Data Available</h3>
                    <p>Unable to load leaderboard data. Please check your configuration.</p>
                </div>
            `;
            return;
        }
        
        leaderboard.innerHTML = this.leaderboardData.map((user, index) => {
            const rank = index + 1;
            const ratingClass = this.getRatingClass(user.rating);
            const changeClass = this.getChangeClass(user.ratingChange);
            
            return `
                <div class="leaderboard-entry rank-${Math.min(rank, 3)}">
                    <div class="rank rank-${Math.min(rank, 3)}">${rank}</div>
                    <div class="user-info">
                        <a href="https://codeforces.com/profile/${user.username}" target="_blank" class="username">
                            ${user.username}
                        </a>
                        <div class="user-details">
                            ${this.getRatingTitle(user.rating)} • Max: ${user.maxRating}
                        </div>
                    </div>
                    <div class="rating ${ratingClass}">
                        ${user.rating}
                    </div>
                    <div class="contests">
                        ${user.contestCount} contests
                    </div>
                    <div class="change ${changeClass}">
                        ${this.formatChange(user.ratingChange)}
                    </div>
                </div>
            `;
        }).join('');
    }

    filterLeaderboard(filter) {
        const entries = document.querySelectorAll('.leaderboard-entry');
        
        entries.forEach(entry => {
            const ratingElement = entry.querySelector('.rating');
            const rating = parseInt(ratingElement.textContent);
            
            let show = true;
            
            switch (filter) {
                case 'expert':
                    show = rating >= 1600;
                    break;
                case 'specialist':
                    show = rating >= 1400 && rating < 1600;
                    break;
                case 'pupil':
                    show = rating >= 1200 && rating < 1400;
                    break;
                case 'newbie':
                    show = rating < 1200;
                    break;
                case 'all':
                default:
                    show = true;
                    break;
            }
            
            entry.style.display = show ? 'grid' : 'none';
        });
    }

    updateStats() {
        const totalUsers = document.getElementById('totalUsers');
        const avgRating = document.getElementById('avgRating');
        const maxRating = document.getElementById('maxRating');
        
        if (this.leaderboardData.length === 0) {
            totalUsers.textContent = '0';
            avgRating.textContent = '0';
            maxRating.textContent = '0';
            return;
        }
        
        const ratings = this.leaderboardData.map(user => user.rating);
        const average = Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length);
        const maximum = Math.max(...ratings);
        
        totalUsers.textContent = this.leaderboardData.length;
        avgRating.textContent = average;
        maxRating.textContent = maximum;
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const refreshBtn = document.getElementById('refreshBtn');
        
        if (show) {
            loading.style.display = 'flex';
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        } else {
            loading.style.display = 'none';
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        errorText.textContent = message;
        errorMessage.style.display = 'flex';
    }

    hideError() {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.style.display = 'none';
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CodeforcesLeaderboard();
});

// Handle Google API loading errors
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error:', msg, 'at', url, ':', lineNo, ':', columnNo);
    return false;
};
