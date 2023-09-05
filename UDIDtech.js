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

require 'faraday'

module UDIDTech
  module Client

    def self.connection
      @connection ||= Faraday.new(
        url: Rails.configuration.api_udid_tech[:url],
        headers: { 'Authorization' => "Token #{Rails.configuration.api_udid_tech[:token]}" },
        ssl: { verify: false }
      )
    end
  end
end

require 'faraday'
require 'json'
require 'udid_tech/client'

class ConnectionsController < ApplicationController
  def get_profile
    response = UDIDTech::Client.connection.get("/recognition/profile/?redirect_url=#{request.protocol}#{[80, 443].include?(request.port) ? request.host : request.host_with_port}")
    send_data response.body, type: 'application/x-apple-aspen-config', disposition: 'attachment; filename="udid.mobileconfig"'
  end

  def get_profile_from_api
    response = UDIDTech::Client.connection.get("/result/#{User.first.id}/?redirect_url=#{request.protocol}#{[80, 443].include?(request.port) ? request.host : request.host_with_port}/connections/parse_profile_body/")
    send_data response.body, type: 'application/x-apple-aspen-config', disposition: 'attachment; filename="udid.mobileconfig"'
  end

  def parse_profile_body
    conn = Faraday.new(
      url: Rails.configuration.api_udid_tech[:url],
      headers: { 'Authorization' => "Api-Key #{Rails.configuration.api_udid_tech[:key]}" },
      ssl: { verify: false }
    ) do |faraday|
      faraday.request :multipart
      faraday.response :logger
    end

    body = request.body.string
    conn.post("/recognize/#{User.first.id}/") do |req|
      req.headers['Content-Type'] = 'application/x-apple-aspen-config'
      req.headers['Content-Length'] = body.size.to_s
      req.body = body
    end

    redirect_to :root, :status => :moved_permanently
  end

  def get_result_from_udid_api
    response = UDIDTech::Client.connection.get("/udid/#{User.first.id}/")
    render json: JSON.parse(response.body)['result']
  end
end
