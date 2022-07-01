import IpReader from "../index";

console.time('timer');
for (let i = 0; i < 1000000;  ++i) {
    IpReader('39.107.84.26');
}
console.timeEnd('timer');

// console.log(IpReader('202.102.136.2'));
// console.log(IpReader('39.107.84.26'));
// console.log(IpReader('223.104.41.29'));
// console.log(IpReader('117.50.180.192'));
// console.log(IpReader('49.234.80.134'));
