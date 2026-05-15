import { Telegraf, Markup } from 'telegraf';

class BotManager {
  private bot: Telegraf | null = null;
  private token: string | null = null;

  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN || "7262943555:AAGU3vo2GiyJmrbvDlOmZzWAx6EwthcMrLg";
    if (this.token) {
      this.initBot(this.token);
    }
  }

  public initBot(token: string) {
    if (this.bot) {
      this.bot.stop();
    }
    
    this.token = token;
    this.bot = new Telegraf(token);

    this.bot.start(async (ctx) => {
      // Use the preview URL instead of github pages which is 404
      const appUrl = "https://id.vipcf.workers.dev";
      return ctx.reply("Selamat datang! Klik tombol di bawah ini untuk membuka aplikasi.", 
        Markup.inlineKeyboard([
          Markup.button.webApp("📱 BUKA APLIKASI", appUrl)
        ])
      );
    });

    this.bot.catch((err, ctx) => {
      console.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
    });

    this.bot.launch().then(() => {
      console.log("Telegram Launcher Bot is running!");
    }).catch(err => {
      console.error("Failed to start bot:", err);
    });
  }

  public startBot(token: string) {
    this.initBot(token);
    return true;
  }

  public stopBot() {
    if (this.bot) {
      this.bot.stop();
      this.bot = null;
      this.token = null;
      return true;
    }
    return false;
  }

  public getStatus() {
    return {
      running: !!this.bot,
      tokenPreview: this.token ? `${this.token.substring(0, 5)}...` : null
    };
  }
}

export const botManager = new BotManager();
