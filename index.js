/**
 * @file 解析IP -> Region
 * @date 2022-06-09
 * @author Perfumere
 */
const fs = require('fs');
const path = require('path');
const DB_PATH  = path.join(__dirname,'./data/ip2region.db') ;
const CITYCODE_PATH  = path.join(__dirname,'./data/citycode.ts') ;

const IP_BASE = [16777216, 65536, 256, 1];
const INDEX_BLOCK_LENGTH = 12;
const TOTAL_HEADER_LENGTH = 8192;

function parseLongInt(ip) {
    const arr = ip.split('.');

    if (arr.length !== 4) {
        throw new Error('invalid ip');
    }

    return arr.reduce((val, n, i) => {
        n = Number(n);

        if (!Number.isInteger(n) || n < 0 || n > 255) {
            throw new Error('invalid ip');
        }

        return val + IP_BASE[i] * n;
    }, 0);
}

function longVal(buffer, offset) {
    const val =
        (buffer[offset] & 0x000000ff) |
        ((buffer[offset + 1] << 8) & 0x0000ff00) |
        ((buffer[offset + 2] << 16) & 0x00ff0000) |
        ((buffer[offset + 3] << 24) & 0xff000000);
    return val < 0 ? val >>> 0 : val;
}

class IPReaderCtor {
    constructor() {
        const dbPath = DB_PATH;

        this.totalInMemoryBytesSize = fs.statSync(dbPath).size;
        this.totalInMemoryBytes = null;

        this.fd = fs.openSync(dbPath, 'r');
        this.dbPath = dbPath;
        this.totalBlocks = this.firstIndexPtr = this.lastIndexPtr = 0;
        this.mallocBuffer();

        this.headerIndexBuffer = Buffer.alloc(TOTAL_HEADER_LENGTH);
        this.headerSip = [];
        this.headerPtr = [];
        this.headerLen = 0;
        this.parseHeader();
    }

    /**
     * 分配内存块
     */
    mallocBuffer() {
        const buffers = Buffer.alloc(8);

        fs.readSync(this.fd, buffers, 0, 8, 0);

        this.firstIndexPtr = longVal(buffers, 0);
        this.lastIndexPtr = longVal(buffers, 4);
        this.totalBlocks = (this.lastIndexPtr - this.firstIndexPtr) / INDEX_BLOCK_LENGTH + 1;
    }

    /**
     * 解析头部
     */
    parseHeader() {
        fs.readSync(
            this.fd,
            this.headerIndexBuffer,
            0,
            TOTAL_HEADER_LENGTH,
            8
        );

        for (let i = 0; i < TOTAL_HEADER_LENGTH; i += 8) {
            const startIp = longVal(this.headerIndexBuffer, i);
            const dataPtr = longVal(this.headerIndexBuffer, i + 4);
            if (dataPtr == 0) break;

            this.headerSip.push(startIp);
            this.headerPtr.push(dataPtr);
            this.headerLen++;
        }
    }

    /**
     * 传入IP, 获取行政区
     * @param {string} ip 
     */
    get(ip) {
        ip = parseLongInt(ip);

        if (this.totalInMemoryBytes === null) {

            this.totalInMemoryBytes = Buffer.alloc(this.totalInMemoryBytesSize);
            fs.readSync(this.fd, this.totalInMemoryBytes, 0, this.totalInMemoryBytesSize, 0);

            this.firstIndexPtr = longVal(this.totalInMemoryBytes, 0);
            this.lastIndexPtr = longVal(this.totalInMemoryBytes, 4);
            this.totalBlocks = ((this.lastIndexPtr - this.firstIndexPtr) / INDEX_BLOCK_LENGTH) | 0 + 1;
        }

        let l = 0, h = this.totalBlocks;
        let sip = 0;
        let m = 0, p = 0;

        while (l <= h) {
            m = (l + h) >> 1;
            p = (this.firstIndexPtr + m * INDEX_BLOCK_LENGTH) | 0;

            sip = longVal(this.totalInMemoryBytes, p);

            if (ip < sip) {
                h = m - 1;
            }
            else {
                sip = longVal(this.totalInMemoryBytes, p + 4);

                if (ip > sip) {
                    l = m + 1;
                }
                else {
                    sip = longVal(this.totalInMemoryBytes, p + 8);

                    if (sip === 0) return null;

                    let dataLen = ((sip >> 24) & 0xFF) | 0;
                    let dataPtr = ((sip & 0x00FFFFFF)) | 0;
                    const bufArray = [];

                    for (let startPos = dataPtr + 4, i = startPos; i < startPos + dataLen - 4; ++i) {
                        bufArray.push(this.totalInMemoryBytes[i]);
                    }

                    return Buffer.from(bufArray, 0).toString();
                }
            }
        }
    }
}

const citys = require(CITYCODE_PATH);
const reader = new IPReaderCtor();
const ERROR_MATCH = Object.freeze({
    pid: 0,
    cid: 0,
    zone: '',
    province: '',
    city: '',
    ips: ''
});

/**
 * 传入IP, 获取地区
 * @param {string} ip
 */
module.exports = function IpReader(ip) {
    if (!reader.get(ip)) {
        return ERROR_MATCH;
    }

    const [pid, cid, ips] = reader.get(ip).split('|');

    if (+pid === 0 || !citys[pid].l) {
        return ERROR_MATCH;
    }

    return {
        pid: +pid,
        cid: +cid,
        zone: citys[pid].z,
        province: citys[pid].n,
        city: citys[pid].l[cid],
        ips
    };
};
