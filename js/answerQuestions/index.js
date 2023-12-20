export default class AnswerQuestions {
    constructor(ctx) {
      this.ctx = ctx;
      
      this.inputValueSid = '';
      this.inputValueUrlQuery = '';
      this.inputValueUid = '';
      this.currentInputType = '';

      // 监听回答问卷事件
      this.touchStartHandler = this.onTouchStart.bind(this);
      canvas.addEventListener('touchstart', this.touchStartHandler);
      wx.onKeyboardConfirm((res) => {
        switch(this.currentInputType) {
            case 'sid':
            this.inputValueSid = res.value;
            break;
            case 'query':
            this.inputValueUrlQuery = res.value;
            break;
            case 'uid':
            this.inputValueUid = res.value;
            break;
        }
        console.log('输入的值(确认):', this.inputValueSid);
        wx.hideKeyboard();
      });
    }

    // 调用键盘
    showKeyboard(type) {
      this.currentInputType = type;
      let defaultValue = '';
      switch (type) {
        case 'sid':
          defaultValue = this.inputValueSid;
          break;
        case 'query':
          defaultValue = this.inputValueUrlQuery;
          break;
        case 'uid':
          defaultValue = this.inputValueUid;
          break;
      }
      wx.showKeyboard({
        defaultValue: defaultValue || '',
        maxLength: 30,
        multiple: false,
        confirmHold: true,
        confirmType: 'done',
        success: (res) => {
          console.log('键盘显示成功');
        },
        fail: (res) => {
          console.log('键盘显示失败');
        },
      });
    }

    // 回答问卷
    onTouchStart(e) {
      e.preventDefault();
  
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;

      // 检测点击位置是否在输入框区域内
      if (x >= 50 && x <= 200 && y >= 10 && y <= 40) {
      this.showKeyboard("sid");
      } else if (x >= 50 && x <= 200 && y >= 50 && y <= 80) {
      this.showKeyboard("query");
      } else if (x >= 50 && x <= 200 && y >= 90 && y <= 120) {
      this.showKeyboard("uid");
      }
  
      // 检测点击位置是否在按钮区域内
      if (x >= 50 && x <= 200 && y >= 140 && y <= 170) {
      // 调用 wx.navigateToMiniProgram 方法
      const surveyId = this.inputValueSid;
      const urlQuery = this.inputValueUrlQuery;
      const uid = this.inputValueUid;

      wx.navigateToMiniProgram({
          appId: 'wx149846fa7a7da33c',
          extraData: {
          surveyId, // 问卷ID
          urlQuery, // url 的 Query参数
          uid, // 用户的唯一标识
          },
          success(res) {
          // 打开成功
          },
          fail(error) {
          // 打开失败
          wx.showToast({
              title: '问卷打开失败',
              icon: 'error',
              duration: 2000
          })
          },
      });
      }
    }

    // 绘制输入框
    drawInput(ctx, label, value, x, y) {
      // 绘制标签
      ctx.fillStyle = '#fff';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x - 5, y + 30 / 2);
    
      // 绘制输入框
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, 150, 30);
    
      // 绘制输入框中的文本
      ctx.fillStyle = '#000000';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'start';
      ctx.textBaseline = 'middle';
      ctx.fillText(value, x + 10, y + 30 / 2);
    }
    
    // 绘制按钮
    drawButton(ctx) {
      const buttonText = '回答问卷';
      const buttonX = 50;
      const buttonY = 140;
      const buttonWidth = 100;
      const buttonHeight = 30;
      
      // 绘制按钮矩形
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
      
      // 计算文字宽度
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      const textWidth = ctx.measureText(buttonText).width;
      
      // 计算文字在按钮中的位置
      const textX = buttonX + (buttonWidth - textWidth + 50) / 2;
      const textY = buttonY + (buttonHeight + 14 / 2) / 2; // 20 是字体大小
      
      // 绘制文字
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(buttonText, textX, textY);
    }

    // 渲染到页面
    render() {
      this.drawInput(this.ctx, 'sid', this.inputValueSid, 50, 10);
      this.drawInput(this.ctx, 'urlQuery', this.inputValueUrlQuery, 50, 50);
      this.drawInput(this.ctx, 'uid', this.inputValueUid, 50, 90);
      this.drawButton(this.ctx);
    }
}