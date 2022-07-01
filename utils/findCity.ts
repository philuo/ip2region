import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import cityList from '../data/citycode';

const regHead = '((?:(?:\\d{1,3}.){3}\\d{1,3}\\|){2})';
const regBody = '(?:(\\d{1,2})\\|([\u4e00-\u9fa5]+)\\|)';

let file = readFileSync(resolve('./src/ip.txt'), 'utf-8');

// 替换省份
const reg = RegExp(`${regHead}${regBody}`, 'g');
let pidSet = new Set();
let citySet = new Set();

file = file.replace(reg, (_, ipHead, pid, cityname) => {
    pidSet.add(pid);
    citySet.add(cityname);
    if (cityList[pid]) {
        return `${ipHead}${pid}|${cityList[pid].l.indexOf(cityname)}|`;
    }

    return _;
});

console.log(pidSet.size);
console.log(citySet.size);

writeFileSync(resolve('./ip.city.txt'), file);