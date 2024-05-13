document.addEventListener("DOMContentLoaded", function () {
  const inputField = document.getElementById("symbol");
  const searchForm = document.getElementById("search");
  const clearButton = document.getElementById("clear-button");
  const pAlert = document.getElementById("popup");
  const searchIcon = document.getElementById("searchbtn");
  const result = document.getElementById("result");

  console.log(searchIcon);
  function handleFormSubmit(event) {
    event.preventDefault();
    if (!inputField.value.trim()) {
      pAlert.style.display = "block";
      return;
    }
    searchForm.submit();
  }
  searchForm.addEventListener("submit", handleFormSubmit);
  clearButton.addEventListener("click", function () {
    inputField.value = "";
    result.innerHTML = "";
  });

  inputField.addEventListener("keyup", async function (event) {
    if (event.key === "Enter") {
      try {
        var symbol = inputField.value.trim();
        // searchText = searchText.toUpperCase();
        // const data = await performSearch();
        // handleSearchResult(data);
      } catch (error) {
        console.error("Error performing search:", error);
      }
    }
  });

  searchIcon.addEventListener("click", function (event) {
    event.preventDefault();

    var symbol = inputField.value;
    console.log("deeeeeeep", symbol);

    if (symbol === "") {
      inputField.setCustomValidity("Please fill out this field");
      inputField.reportValidity();
      console.log("Check");
    } else {
      fetch("/search?symbol=" + symbol)
        .then((response) => response.json())
        .then((data) => {
          if("error" in data){
            result.innerHTML = "<p>Error:No record has been found, please enter a valid symbol</p>";
            return;
          }
          console.log(data.ticker_symbol)
          document.getElementById("company_logo").src = data.company_logo;
          document.getElementById("company_name").innerHTML = data.company_name;
          document.getElementById("tic_symbol").innerHTML = data.ticker_symbol;
          document.getElementById("exchange_code").innerHTML = data.exchange_code;
          document.getElementById("ipo_date").innerHTML = data.ipo_date;
          document.getElementById("industry_category").innerHTML = data.industry_category;

          result.style.display = "block";
          fetchStockInfo(symbol);
        })
        .catch((error) => console.error("Error:", error));
    }
  });
});

function tabChange(id) {
  console.log(id);
  let divs = document.querySelectorAll(".company-container");
  divs.forEach(function (div) {
    div.classList.remove("highlight");
  });

  var tabMenu = document.querySelectorAll(".tb");
  if (tabMenu.length > 0) {
    tabMenu.forEach(function (tab) {
      tab.classList.remove("highlight");
    });
    document.getElementById(id).classList.add("highlight");
    var selected = document.querySelector(`.tb[onclick="tabChange('${id}')"]`);
    selected.classList.add("highlight");
    if (id === 'charts') {
      fetchChart(document.getElementById('tic_symbol').innerText.trim());
    }
  }
}

function fetchStockInfo(symbol) {
  fetch(`/get_stock_info?symbol=` + symbol)
    .then((response) => response.json())
    .then((data) => {
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December" 
      ];
      const tradingDay = new Date(data.t * 1000);
      const month = months[tradingDay.getMonth()];
      const day = tradingDay.getDate();
      const year = tradingDay.getFullYear();
      document.getElementById("ticker_symbol").innerText = symbol.toUpperCase();
      document.getElementById("trading_day").innerText = ` ${day} ${month}, ${year}`;
      document.getElementById("previous_close").innerText = data.pc;
      document.getElementById("opening_price").innerText = data.o;
      document.getElementById("high_price").innerText = data.h;
      document.getElementById("low_price").innerText = data.l;
      document.getElementById("change").innerText = data.d;
      document.getElementById("change_percent").innerText = data.dp;
      const changeValue = parseFloat(data.d);
      const changePercentValue = parseFloat(data.dp);

          if (changeValue < 0) {
            const redArrowImg = document.createElement('img');
            redArrowImg.src = './RedArrowDown.png';
            redArrowImg.alt = 'Red Arrow Down';
            document.getElementById('change').appendChild(redArrowImg);
            redArrowImg.height = 20;
            redArrowImg.width = 20;
          } else if (changeValue > 0) {
            const greenArrowImg = document.createElement('img');
            greenArrowImg.src = './GreenArrowUp.png';
            greenArrowImg.alt = 'Green Arrow Up';
            document.getElementById('change').appendChild(greenArrowImg);
            greenArrowImg.height = 20;
            greenArrowImg.width = 20;
          }

          if (changePercentValue < 0) {
            const redArrowPercentImg = document.createElement('img');
            redArrowPercentImg.src = './RedArrowDown.png';
            redArrowPercentImg.alt = 'Red Arrow Down';
            document.getElementById('change_percent').appendChild(redArrowPercentImg);
            redArrowPercentImg.height = 20;
            redArrowPercentImg.width = 20;
          } else if (changePercentValue > 0) {
            const greenArrowPercentImg = document.createElement('img');
            greenArrowPercentImg.src = './GreenArrowUp.png';
            greenArrowPercentImg.alt = 'Green Arrow Up';
            document.getElementById('change_percent').appendChild(greenArrowPercentImg);
            greenArrowPercentImg.height = 20;
            greenArrowPercentImg.width = 20;
          }
          fetchNews(symbol);
    })
    .catch((error) => console.error("Error fetching stock info:", error));
}

function fetchNews(symbol) {
  fetch(`/news?symbol=` +symbol)
    .then((response) => response.json())
    .then((data) => displayNews(data))
    .catch((error) => console.error("Error fetching company news:", error));
}
function displayNews(newsData) {
  const result = document.getElementById("news");
  result.innerHTML = "";

  const newsContainer = document.createElement("div");
  newsContainer.classList.add("news-container");

  let articlesDisplayed = 0;

  for (let i = 0; i < newsData.length && articlesDisplayed < 5; i++) {
    const article = newsData[i];
    if (
      article.image &&
      article.headline &&
      article.datetime &&
      article.url
    ) {
      const date = new Date(article.datetime * 1000);

      const newsCard = document.createElement("div");
      newsCard.classList.add("news-card");

      const image = document.createElement("img");
      image.src = article.image;
      image.alt = "Article Image";

      const title = document.createElement("h3");
      title.textContent = article.headline;

      const dateElement = document.createElement("p");
      dateElement.textContent = date.toDateString();

      const link = document.createElement("a");
      link.href = article.url;
      link.textContent = "See Original Post";
      link.target = "_blank";

      newsCard.appendChild(image);
      newsCard.appendChild(title);
      newsCard.appendChild(dateElement);
      newsCard.appendChild(link);

      newsContainer.appendChild(newsCard);
      articlesDisplayed++;
    }
  }

  result.appendChild(newsContainer);
  newsContainer.style.display = "block";
}

function fetchChart(symbol) {
  fetch(`/charts?symbol=${symbol}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to retrieve stock price. HTTP status ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      console.log(data); 
      if (!data || !data.dates || !data.prices || !data.volumes) {
        throw new Error('Invalid data format received from server');
      }

      const dates = data.dates.map(date => new Date(date));
      const stockPrices = data.prices; 
      const volumes = data.volumes; 
      const chartData = dates.map((date, index) => [date.getTime(), stockPrices[index]]);
      const volData = dates.map((date, index) => [date.getTime(), volumes[index]]);

      Highcharts.stockChart('stockChartContainer', {
        rangeSelector: {
          allButtonsEnabled: true,
          inputEnabled: true,
          selected: 1,
          buttons: [{
              type: 'day',
              count: 7,
              text: '7d'
          }, {
              type: 'day',
              count: 15,
              text: '15d'
          }, {
              type: 'month',
              count: 1,
              text: '1m'
          }, {
              type: 'month',
              count: 3,
              text: '3m'
          }, {
              type: 'month',
              count: 6,
              text: '6m'
          }],
          buttonTheme: {
              width: 50
          }
          },
          title: {
            text: `Stock Price ${symbol} (${new Date().toLocaleDateString()})` 
          },
          subtitle: {
            text: '<a href="https://polygon.io/" target="_blank" style="color: blue;text-decoration: underline;">Source: Polygon.io</a>'
          },
          navigator: {
            enabled: true,
          },
          plotOptions: {
              series: {
                  pointWidth: 5,
              }
          },
          xAxis: {
              type: 'datetime',
              ordinal: true,
            
          },
          yAxis: [{
              title: {
                  text: 'Stock Price'
              },
              labels: {
                  align: 'right',
                  x: -3
              },
              opposite: false
          }, {
              title: {
                  text: 'Volume'
              },
              labels: {
                  align: 'left',
                  x: 3
              },
              opposite: true
          }],
          series: [{
              name: 'Stock Price',
              type: 'area',
              data: chartData,
              pointStart: chartData[0][0],
              yAxis: 0,

              fillColor: {
                  linearGradient: {
                      x1: 0,
                      y1: 0,
                      x2: 0,
                      y2: 1
                  },
                  stops:[
                    [0, 'rgba(136,202,252,)'], 
                    [1, 'rgba(135, 206, 250, 0)']
                  ]
              }
          }, {
              name: 'Volume',
              type: 'column',
              color: 'black',
              data: volData,
              pointStart: volData[0][0],
              pointInterval: 24 * 3600 * 1000,
              yAxis: 1
          }]
      });
    })
    .catch(error => console.error('Error fetching stock price/volume data:', error));
}

