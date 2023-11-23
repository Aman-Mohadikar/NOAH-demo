import moment from 'moment';
import fs from 'fs';
import path from 'path';

export const isUndefined = (value) => value === undefined;
export const isNull = (value) => value === null;

export const convertIsoDatoToIsoDateTime = (date) => {
  if (isUndefined(date)) return undefined;
  if (!date) {
    return null;
  }
  return `${date}T${moment().format('HH:mm:ssZ')}`;
};

export const convertToIsoDateTime = (date) => {
  if (isUndefined(date)) return undefined;
  if (!date) {
    return null;
  }
  return moment(date).format('YYYY-MM-DDTHH:mm:ssZ');
};

export const convertToIsoDate = (date) => {
  if (isUndefined(date)) return undefined;
  if (!date) {
    return null;
  }
  return moment(date).format('YYYY-MM-DD');
};

export const checkIfValidDate = (date) => {
  if (!date) return false;
  return moment(date).isValid();
};

export const convertToStartOfDay = (date) => {
  if (!date) return null;
  return moment(date).set({
    h: 0, m: 0, s: 0, ms: 0,
  });
};

export const convertToEndOfDay = (date) => {
  if (!date) return null;
  return moment(date).set({
    h: 23, m: 59, s: 59, ms: 999,
  });
};

export const getUpdatableDate = (value) => {
  if (isNull(value)) return null;
  if (isUndefined(value)) return undefined;

  return moment(convertIsoDatoToIsoDateTime(value));
};

export const filterUndefinedFromObject = (obj) => (
  Object.keys(obj).reduce((acc, key) => {
    if (!isUndefined(obj[key])) {
      acc[key] = obj[key];
    }
    return acc;
  }, {}));

export const deleteFile = (filePath) => (
  new Promise((resolve, reject) => {
    if (!filePath) {
      reject(new Error('Invalid Path'));
    }
    fs.unlink(filePath, (err) => {
      if (err) reject(err);
      // if no error, file has been deleted successfully
      resolve(true);
    });
  })
);


export const getFileContent = (resourceDir, relativePath) => new Promise((resolve, reject) => {
  fs.readFile(path.join(resourceDir, relativePath), 'utf8', (err, data) => {
    if (err) {
      reject(err);
    }
    resolve(data);
  });
});

export const formatStr = (str) => (str || '');
export const formatDate = (date) => (date ? moment(date).format('DD/MM/YYYY') : '');


export const sanitizeUrl = (url) => {
  if (!url) return url;
  let newUrl = url;
  if (url.endsWith('/')) {
    newUrl = url.substring(0, url.length - 1);
  }
  return newUrl;
};

export const getEnumArrayFromObj = (enumObj) => {
  if (!enumObj) return null;
  return Object.keys(enumObj).map((key) => enumObj[key]);
};

export const JSON_stringify = (s, emit_unicode) => {
  var json = JSON.stringify(s);
  return emit_unicode ? json : json.replace(/[\u007f-\uffff]/g,
    function (c) {
      return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
    }
  );
}

/**
 * Validate if the month is valid
 * @param {string | number} month The month that you want to check for
 * @returns {boolean} True if the month is valid, false otherwise. the month should
 * be from 1 - January to 12 - December. 0 is not a valid month
 */
export const isValidMonth = (month) => {
  if (isInt(month) === false) {
    return false;
  }
  const parsedMonth = parseInt(month);
  return parsedMonth >= 1 && parsedMonth <= 12;
}

/**
 * Returns true if the year is in YYYY format
 * @param {number|string} year 
 * @returns {boolean}
 */
export const isValidYear = (year) => {
  if (isInt(year) === false) {
    return false;
  }
  const parsedYear = parseInt(year);
  if (parsedYear.toString().length !== 4) {
    return false;
  }
  return true;
}

/**
 * Returns an array of arrays split into chunks specified by the limit
 * @param {Array} array 
 * @param {number} limit 
 * @returns {Array.<Array>}
 */
export const splitArray = (array, limit) => {
  if (limit <= 0) {
    throw new Error("Limit must be greater than 0.");
  }

  const result = [];
  let currentIndex = 0;

  while (currentIndex < array.length) {
    result.push(array.slice(currentIndex, currentIndex + limit));
    currentIndex += limit;
  }

  return result;
}

/**
 * Checks if the date supplied is in YYYY-MM-DD format
 * @param {string} dateString 
 * @returns {boolean}
 */
export const isValidDateFormat = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  const isInValidFormat = regex.test(dateString)
  if (isInValidFormat) {
    return moment(dateString, 'YYYY-MM-DD').isValid();
  }
  return false;
}

/**
 * Check if the String is in YYYY-MM format and has valid month and year
 * @param {string} monthYearString The YYYY-MM formatted String
 * @returns {boolean} True if the monthYearString is valid
 */
export const isValidMonthYear = (_monthYearString) => {
  if (!_monthYearString) {
    return false;
  }
  const monthYearString = String(_monthYearString).trim();
  if (monthYearString.split('-').length !== 2) {
    return false;
  }
  const [year, month] = monthYearString.split('-');
  return isValidMonth(month) && isValidYear(year);
}

/**
 * Retirns true if the value is a float
 * @param {string|number} val 
 * @returns {boolean}
 */
export const isFloat = (val) => {
  var floatRegex = /^-?\d+(?:[.,]\d*?)?$/;
  if (!floatRegex.test(val))
    return false;

  val = parseFloat(val);
  if (isNaN(val))
    return false;
  return true;
}

/**
 * Returns if the value is an integer without any decimal
 * @param {string|number} val 
 * @returns {boolean}
 */
export const isInt = (val) => {
  var intRegex = /^-?\d+$/;
  if (!intRegex.test(val))
    return false;

  var intVal = parseInt(val, 10);
  return parseFloat(val) == intVal && !isNaN(intVal);
}

/**
 * Checks if given input is valid string or not
 * @param {*} str 
 * @returns {boolean}
 */
export const isValidString = (str) => {
  return typeof str === 'string' && str.trim().length > 0 && str !== 'null' && str !== 'undefined' && str !== 'NaN';
}