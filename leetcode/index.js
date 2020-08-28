 /**
  * 字符串中最长不重复子串长度
  * @param {string} s 
  * @return {number}
  */
var lengthOfLongestSubstring = function(s) {
  let arr = [];
  let max = 1;

  if (s == '') {
    return 0;
  }

  for (let i = 0; i < s.length; i++) {
    const index = arr.indexOf(s[i]);
    if (index > -1) {
      max = Math.max(max, arr.length);
      arr = arr.slice(index + 1);
      arr.push(s[i]);
    } else {
      arr.push(s[i]);
    }

    if (i == s.length - 1) {
      max = Math.max(max, arr.length);
    }
  }

  return max;
};

// console.log(lengthOfLongestSubstring('dvdf'));

/**
 * 两个有序数组寻找中位数
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function(nums1, nums2) {
  var arr = [];
  if (nums1 == '') {
    arr = findMedianArr(nums2);
  } else if (nums2 == '') {
    arr = findMedianArr(nums1);
  } else {
    arr = findMedianArr(nums1).concat(findMedianArr(nums2));
  }

  arr.sort((a, b) => {
    return b - a;
  })

  return findMedianArr(arr, 'num');
};

/**
 * 查找数组中位数 
 * @param {array} arr || number
 */
function findMedianArr(arr, type = 'arr') {
  const length = arr.length;

  let result;

  if (length % 2 == 0) {
    // return (arr[length / 2] + arr[length / 2 - 1]) / 2;
    result = [arr[length / 2], arr[length / 2 - 1]];
  } else {
    result = [arr[Math.floor(length / 2)]];
  }

  if (type == 'arr') {
    return result;
  } else {
    if (result.length == 2) {
      return (result[0] + result[1]) / 2;
    } else {
      return result[Math.floor(result.length / 2)];
    }
  }
}

// console.log(findMedianSortedArrays([1, 2, 5], [1, 2, 3]));

/**
 * @param {number[][]} matrix
 * @return {number[]}
 */
var spiralOrder = function(matrix) {
  let i = 0, // 横坐标
      j = 0, // 纵坐标
      q = 0, // 圈数
      width = matrix[0].length,
      height = matrix.length,
      arr = [],
      length = width * height;

  while(arr.length < length) {
      while(i + q < width - 1 - q) {
          arr.push(matrix[j][i]);
          i++;
      }

      arr.push(matrix[j][i]);

      if (arr.length == length) {
          break;
      }

      j++;

      while(j + q < height - 1 - q) {
          arr.push(matrix[j][i]);
          j++;
      }

      arr.push(matrix[j][i]);

      if (arr.length == length) {
          break;
      }

      i--;

      while(i > q) {
          arr.push(matrix[j][i]);
          i--;
      }

      arr.push(matrix[j][i]);

      if (arr.length == length) {
          break;
      }

      j--;

      while(j > 1) {
          arr.push(matrix[j][i]);
          j--;
      } 

      arr.push(matrix[j][i]);

      if (arr.length == length) {
          break;
      }
      q++;
  }

  return arr;
};

// const arr1 = [[1,2,3]];
// const arr2 = [[1,2,3],[4,5,6],[7,8,9]];
// const arr3 = [[1,2,3,4],[5,6,7,8],[9,10,11,12]];

// console.log(spiralOrder(arr2));

var searchInsert = function(nums, target) {
  // console.log(nums);
  const index = nums.indexOf(target)
  if (index > -1) {
      return index;
  }

  nums.push(target);
  nums.sort((a, b) => {
      return a - b;
  })

  return nums.indexOf(target);
};

// console.log(searchInsert([1, 3, 5, 6], 2));


var countAndSay = function(n) {
  let str = 1;

  for (i = 2; i<= n; i++) {
      str = test(str);
  }

  return str;
};

function test(str) {
  str = str.toString().split('');

  const arr = [];
  let count = 1;
  for (let i = 0; i < str.length; i++) {
    if (str[i] == str[i+1]) {
        count++;
    } else {
        arr.push({ count: count, key: str[i] });
        count = 1;
    }
  }

  let res = '';
  for (let item of arr) {
    res += item['count'] + '' + item['key'];
  }

  return res;
}

// console.log(countAndSay(5));

/**
 * @param {number} x
 * @param {number} y
 * @return {number}
 */
var hammingDistance = function(x, y) {
  // x2 = x.toString(2);
  // y2 = y.toString(2);

  // if (x2.length > y2.length) {
  //     y2 = y2.padStart(x2.length, 0)
  // }

  // if (x2.length < y2.length) {
  //     x2 = x2.padStart(y2.length, 0)
  // }


  // let num = 0;

  // for (let i = 0; i < x2.length; i++ ) {
  //     if (x2[i] != y2[i]) {
  //         num++;
  //     }
  // }

  // res = (x ^ y).toString(2).match(/1/g) ? (x ^ y).toString(2).match(/1/g).length : 0;
  res = (x ^ y).toString(2).match(/1/g) ?.length || 0;

  return num;
};

// console.log(hammingDistance(1, 1));

var hammingWeight = function(n) {
  if (n == 0) {
      return 0;
  }
  return n.toString(2).match(/1/g).length;
};

var hanmingDistanceSum = function(nums) {
  let sum = 0;

  for (i = 0; i < 32; i++) {
      let x = 0, // 1的个数
          y = 0; // 0的个数
  
      for (item of nums) {
          // console.log(item);
          if (item>>>i & 1) {
              x++;
          } else {
              y++;
          }
      }
      
      sum += x*y;
  } 
  
  return sum
}

console.log(hanmingDistanceSum([4, 14, 2]));

// console.log(hammingWeight(00000000000000000000000000000000));

var missingNumber = function(nums) {
  const arr = nums.sort((a, b) => {
    return a - b;
  })

  // let index = Math.ceil(arr.length / 2);
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] != i) {
      return arr[i] - 1;
    }
  }
};

var missingNumber2 = function(nums) {
  let res = nums.length; // 考虑[0, 1] 输出 2这种情况

  for (let i = 0; i < nums.length; i++) {
    res ^= nums[i] ^ i;
  }

  return res;
}

var isValid = function(s) {
  const arr = [];

  for (let i = 0; i < s.length; i++) {
    if (['(', '[', '{'].indexOf(s[i]) > -1) {
      arr.push(s[i]);
    } else {
      const a = arr[arr.length - 1];
      if ((a == '(' && s[i] == ')') || (a == '{' && s[i] == '}') || (a == '[' && s[i] == ']')) {
        arr.pop();
      } else {
        return false;
      }
    }
  }

  if (arr == '') {
    return true;
  }

  return false
};
// console.log(isValid('('));

var reverseBits = function(n) {
  return n.toString().split('').reverse().join('');
};
console.log(reverseBits(00000010100101000001111010011100));





/**
 * 二叉树遍历
 */
class TreeNode { 
  // 树的结构 
  constructor(val, left, right) {
    this.val = val;
    this.left = left; // TreeNode 实例例 
    this.right = right; // TreeNode 实例例
  }

  maxDepth = (tree) => {
    // todo: 你的代码 
    if (tree === null) {
      return 0;
    }
    let leftDepth = this.maxDepth(tree),
        rightDepth = this.maxDepth(tree);
    
    return Math.max(leftDepth, rightDepth) + 1;
  }
}