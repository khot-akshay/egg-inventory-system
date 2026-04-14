// fileUtils.js

import currency from "currency.js";

/**
 * Converts a file to a Base64-encoded string.
 * @param {File} file - The file to be converted.
 * @returns {Promise<string>} - A Promise that resolves to a Base64-encoded string.
 */


export const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  export const removeUnderScore = (value:string)=>{
    const result = value?.split('_').join(' ')?.replace(/\b\w/g, (char) => char?.toUpperCase())
    return result
  }

  export const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  export const convertCurrency = (value: number) => {
    const formattedPrice = currency(value, {
      symbol: "₹",
      precision: 0,
  
    }).value
    const indianFormatPrice = new Intl.NumberFormat("en-IN").format(formattedPrice);
  
    return `₹ ${indianFormatPrice}`
  }
  