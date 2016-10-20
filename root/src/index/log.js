class Logger {
  constructor() {
    this.disable = false;
  }

  log(lv, msg, callback) {
    !this.disable && console.log(msg);
    !this.disable && callback && callback({
      level: lv,
      message: msg
    });
  }

}

var logger = new Logger();

export default logger;