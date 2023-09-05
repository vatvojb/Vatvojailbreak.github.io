// UDIDtech.js
export class UDIDTech {
  inited: boolean;
  profileURL: string;
  success?: boolean;

  constructor(profileURL: string) {
      this.inited = false;
      this.success = undefined;
      this.profileURL = profileURL;
  }

  async getProfile() {
      const response = await fetch(this.profileURL);
      const blob = await response.blob();
      const file = window.URL.createObjectURL(blob);
      window.location.assign(file);
  }

  attachRecognitionCallback(cssSelector: string) {
      const
          udidTechInstance = this,
          elements = window.document.querySelectorAll(cssSelector);

      for (let i = 0; i < elements.length; i++) {
          elements[i].addEventListener('click', function () {
              udidTechInstance.getProfile().catch();
          });
      }
  }

  init = async () => {
      this.inited = true;

      const udidTechErrorDetail = this.getParamByName('udid_tech_err_detail');

      if (udidTechErrorDetail) {
          alert(unescape(udidTechErrorDetail))

          return;
      }

      const udidTechResult = this.getParamByName('udid_tech_res');

      if (udidTechResult) {
          localStorage.setItem('_udid_tech_res', atob(udidTechResult));

          return;
      }

      this.success = true;
  };

  getParamByName = (name: String) => {
      const match = RegExp(`[?&]${name}=([^&]*)`).exec(window.location.search);
      return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }
}
