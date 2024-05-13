from flask import Flask, request, json, jsonify, send_file, abort
import requests
from datetime import datetime, timedelta


app = Flask(__name__, static_url_path='')

API_KEY = "cn8imjpr01qocbpgeuc0cn8imjpr01qocbpgeucg"
FINNHUB_API_URL = "https://finnhub.io/api/v1/stock/profile2"
FINN_QUOTE_URL = "https://finnhub.io/api/v1/quote"
FINN_NEWS_URL = "https://finnhub.io/api/v1/company-news"
POLY_API = "chLsvUjYEHxxMx3yGdtGbMVZo76wbV1t"


@app.route("/")
def index():
    return app.send_static_file("search.html")

@app.route('/favicon.ico')
def favicon():
    
    return abort(404)

# THIS IS THE SEARCH TAB

@app.route('/search', methods=['GET'])
def search_stock():
    symbol = request.args.get('symbol')
    if not symbol:
        return jsonify({"error": "Please provide a stock symbol"}), 400

    params = {"symbol": symbol, "token": API_KEY}
    response = requests.get(FINNHUB_API_URL, params=params)

    if response.status_code != 200:
        return jsonify({"error": "Failed to retrieve stock information"}), 500
    
    stock_data = response.json()
    company_logo = stock_data.get("logo")
    company_name = stock_data.get("name")
    ticker_symbol = stock_data.get("ticker")
    exchange_code = stock_data.get("exchange")
    ipo_date = stock_data.get("ipo")
    industry_category = stock_data.get("finnhubIndustry")

    result = {
        "company_logo": company_logo,
        "company_name": company_name,
        "ticker_symbol": ticker_symbol,
        "exchange_code": exchange_code,
        "ipo_date": ipo_date,
        "industry_category": industry_category
    }

    return jsonify(result)

# THIS IS THE STOCK INFO TAB

@app.route('/get_stock_info', methods=['GET'])
def get_stock():
    symbol = request.args.get("symbol")
    if not symbol:
        return jsonify({"error": "Symbol parameter is missing"}), 400
    
    params = {"symbol": symbol, "token": API_KEY}
    response = requests.get(FINN_QUOTE_URL, params=params)
    
    if response.status_code == 200:
        data = response.json()
        return jsonify(data)
    else:
        return jsonify({"error": "Failed to fetch stock information"}), response.status_code


# THIS IS THE NEWS TAB

@app.route('/news')
def news():
    symbol = request.args.get('symbol')
    if not symbol:
        return jsonify({"error": "Please provide a stock symbol"}), 400
    start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    end_date = datetime.now().strftime('%Y-%m-%d')

    params = {
        "symbol": symbol,
        "from": start_date,
        "to": end_date,
        "token": API_KEY
    }
    response = requests.get(FINN_NEWS_URL, params=params)
    if response.status_code != 200:
        return jsonify({"error": "Failed to retrieve company news"}), 500
    newsData = response.json()
    return jsonify(newsData)

# THIS IS THE CHARTS TAB
from datetime import datetime, timedelta

@app.route('/charts')
def stock_vol():
    symbol = request.args.get('symbol')
    if not symbol:
        return jsonify({"error": "Please provide a stock symbol"}), 400
    end_date = datetime.now()
    start_date = end_date - timedelta(days=186)
    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d')

    url = f"https://api.polygon.io/v2/aggs/ticker/{symbol}/range/1/day/{start_date_str}/{end_date_str}?adjusted=true&sort=asc&apiKey={POLY_API}"
    response = requests.get(url)
    if response.status_code != 200:
        print(response.content)
        return jsonify({"error": "Failed to retrieve stock price"}), 500
    stock_data = response.json().get('results', [])

    dates = [entry['t'] for entry in stock_data]
    prices = [entry['c'] for entry in stock_data]
    volumes = [entry['v'] for entry in stock_data]

    chart_data = {
        "dates": dates,
        "prices": prices,
        "volumes": volumes
    }
    return jsonify(chart_data)

if __name__ == '__main__':
    app.run()

