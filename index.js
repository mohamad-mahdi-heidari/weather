const axios = require('axios');
const cheerio = require('cheerio');
fs = require('fs');
const baseUrl='https://www.accuweather.com/';
const mainUrl = 'https://www.accuweather.com/en/gb/london/ec4a-2/august-weather/328328';
const getMonthList = async (url) => {
    try {
        const response = await axios.get(url);
        const {data} = response;
        const $ = cheerio.load(data);
        const monthListFunction = [];
        $('.map-dropdown-content').first().children().each(async (i, el) => {
            const monthUrl = $(el)[0].attribs.href;
            const monthName = $(el).text().trim();
            const getMonthFunc=getMonth(monthUrl,monthName);
            monthListFunction.push(getMonthFunc);
        });
        await Promise.all(monthListFunction);

    } catch (e) {
        console.log(`error fetching data ${e}`);
    }
}
const getMonth = async (monthUrl,monthName) => {
    try {
        const response = await axios.get(`${baseUrl}${monthUrl}`);
        const {data} = response;
        const $ = cheerio.load(data);
        const dataList = [];
        $('.monthly-calendar').children().each((i, el) => {
            const dayElement = $(el).find('.monthly-panel-top');
            const tempElement = $(el).find('.temp');
            const day = dayElement.text().trim();
            const high = tempElement.find('.high').text().trim();
            const low = tempElement.find('.low').text().trim();
            const item = {day, high, low};
            dataList.push(item);
        });
        saveData(`${monthName}.json`, dataList).then(()=>{
            console.log(`writing month : ${monthName} done`);
        }).catch((e)=>{
            console.log(`error fetching month :${monthName}  ${e}`);
        });

    } catch (e) {
        console.log(`error fetching month :${monthName}  ${e}`);
    }
}
const saveData = async (name, data) => {
    fs.writeFile(`./month/${name}`, JSON.stringify(data), (err) => {
        return !!err;
    });

}
getMonthList(mainUrl).then(r => console.log("job done")).catch((e)=>{console.log("job failed")});

