import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const provinceList = {
    /** 去除保留 */
    "保留": 0,

    "北京": 1,
    "天津": 2,
    "上海": 3,
    "重庆": 4,
    "河北": 5,
    "河南": 6,
    "山东": 7,
    "辽宁": 8,
    "吉林": 9,
    "黑龙江": 10,
    "安徽": 11,
    "云南": 12,
    "新疆": 13,
    "江苏": 14,
    "浙江": 15,
    "江西": 16,
    "湖北": 17,
    "广西": 18,
    "甘肃": 19,
    "山西": 20,
    "内蒙古": 21,
    "陕西": 22,
    "湖南": 23,
    "福建": 24,
    "贵州": 25,
    "广东": 26,
    "青海": 27,
    "西藏": 28,
    "四川": 29,
    "宁夏": 30,
    "海南": 31,
    "台湾": 32,
    "香港": 33,
    "澳门": 34
};

let file = readFileSync(resolve('./ip.txt'), 'utf-8');

// 替换省份
Object.keys(provinceList).forEach(item => {
    const reg = RegExp(`(?<=\\d\\|)(${item})`, 'g');

    file = file.replace(reg, (_, m) => {
        return provinceList[item];
    });
});


writeFileSync(resolve('./ip.merge.cn.txt'), file);