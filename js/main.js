import Player from './player/index'
import Enemy from './npc/enemy'
import BackGround from './runtime/background'
import GameInfo from './runtime/gameinfo'
import Music from './runtime/music'
import DataBus from './databus'

const ctx = canvas.getContext('2d')
const databus = new DataBus()

/**
 * 游戏主函数
 */
export default class Main {
  constructor() {
    // 维护当前requestAnimationFrame的id
    this.aniId = 0
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    this.restart()
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
      defaultValue,
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
  
  restart() {
    databus.reset()

    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )

    this.bg = new BackGround(ctx)
    this.player = new Player(ctx)
    this.gameinfo = new GameInfo()
    this.music = new Music()

    this.bindLoop = this.loop.bind(this)
    this.hasEventBind = false

    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId)

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
    // game.js
  }

  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    if (databus.frame % 30 === 0) {
      const enemy = databus.pool.getItemByClass('enemy', Enemy)
      enemy.init(6)
      databus.enemys.push(enemy)
    }
  }

  // 全局碰撞检测
  collisionDetection() {
    const that = this

    databus.bullets.forEach((bullet) => {
      for (let i = 0, il = databus.enemys.length; i < il; i++) {
        const enemy = databus.enemys[i]

        if (!enemy.isPlaying && enemy.isCollideWith(bullet)) {
          enemy.playAnimation()
          that.music.playExplosion()

          bullet.visible = false
          databus.score += 1

          break
        }
      }
    })

    for (let i = 0, il = databus.enemys.length; i < il; i++) {
      const enemy = databus.enemys[i]

      if (this.player.isCollideWith(enemy)) {
        databus.gameOver = true

        break
      }
    }
  }

  // 游戏结束后的触摸事件处理逻辑
  touchEventHandler(e) {
    e.preventDefault()

    const x = e.touches[0].clientX
    const y = e.touches[0].clientY

    const area = this.gameinfo.btnArea

    if (x >= area.startX
        && x <= area.endX
        && y >= area.startY
        && y <= area.endY) this.restart()
  }

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
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value, x + 150 / 2, y + 30 / 2);
  }

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

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    this.bg.render(ctx)
    // this.drawInput(ctx);
    this.drawInput(ctx, 'sid', this.inputValueSid, 50, 10);
    this.drawInput(ctx, 'urlQuery', this.inputValueUrlQuery, 50, 50);
    this.drawInput(ctx, 'uid', this.inputValueUid, 50, 90);
    this.drawButton(ctx);
    databus.bullets
      .concat(databus.enemys)
      .forEach((item) => {
        item.drawToCanvas(ctx)
      })

    this.player.drawToCanvas(ctx)

    databus.animations.forEach((ani) => {
      if (ani.isPlaying) {
        ani.aniRender(ctx)
      }
    })

    this.gameinfo.renderGameScore(ctx, databus.score)

    // 游戏结束停止帧循环
    if (databus.gameOver) {
      this.gameinfo.renderGameOver(ctx, databus.score)

      if (!this.hasEventBind) {
        this.hasEventBind = true
        this.touchHandler = this.touchEventHandler.bind(this)
        canvas.addEventListener('touchstart', this.touchHandler)
      }
    }
  }

  // 游戏逻辑更新主函数
  update() {
    if (databus.gameOver) return

    this.bg.update()

    databus.bullets
      .concat(databus.enemys)
      .forEach((item) => {
        item.update()
      })

    this.enemyGenerate()

    this.collisionDetection()

    if (databus.frame % 20 === 0) {
      this.player.shoot()
      this.music.playShoot()
    }
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++

    this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
}
