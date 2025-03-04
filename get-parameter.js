function getParameter(paramName) {
  let paramValue;
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    // Запущено в Node.js
    const args = process.argv.slice(2);
	paramName = '--' + paramName;
    const paramArgIndex = args.findIndex(arg => arg.startsWith(paramName));
    if (paramArgIndex>-1) {
      const paramArg = args[paramArgIndex];
      // Если параметр в формате --имя_параметра=значение
      if (paramArg.includes('=')) {
        paramValue = paramArg.split('=')[1] // Возвращаем значение параметра
      }
	  else {
        // Если параметр в формате --имя_параметра значение
         paramValue = args[paramArgIndex + 1] // Возвращаем следующее значение после параметра
      }
    }
  } 
  else if (typeof window !== 'undefined') {
    // Запущено в браузере
    const url = new URL(window.location.href);
    const params = Object.fromEntries(url.searchParams.entries());
    
    // Проверяем GET-параметры
    if (params[paramName]) {
      paramValue = params[paramName] // Возвращаем значение параметра из GET-параметров
    }
    else{
		// Проверяем хэш
		const hashParams = new URLSearchParams(window.location.hash.slice(1));
		if (hashParams.has(paramName)) {
		  paramValue = hashParams.get(paramName) // Возвращаем значение параметра из хэша
		}
	}
  }
  
  return paramValue;
}

module.exports = getParameter;