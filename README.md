# MarketSentinel

MarketSentinel is a real-time stock market monitoring and analysis application that provides insights into market trends, stock performance, and news analysis.

## Features

- Real-time stock price monitoring
- Biggest losers tracking
- Stock news aggregation and analysis
- Market sentiment analysis
- Custom stock watchlists
- Historical data visualization

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- Data Sources: Yahoo Finance API, News API
- AI Analysis: Custom sentiment analysis

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/MarketSentinel.git
cd MarketSentinel
```

2. Install dependencies:
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
NEWS_API_KEY=your_news_api_key
XAI_API_KEY=your_xai_api_key
SESSION_SECRET=your_session_secret
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. The application will be available at `http://localhost:3000`

## Project Structure

```
MarketSentinel/
├── client/                 # Frontend React application
├── server/                 # Backend Express server
│   ├── services/          # Backend services
│   ├── routes/            # API routes
│   └── public/            # Static files
├── package.json           # Node.js dependencies
└── requirements.txt       # Python dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Yahoo Finance API for stock data
- News API for news aggregation
- Various open-source libraries and tools 