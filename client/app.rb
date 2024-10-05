
require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
require "action_cable/engine"
require "rails/test_unit/railtie"

require 'rack'
require 'puma'
require 'rack/handler/puma'

require_relative './controllers'

include Controllers

database = 'development.sqlite3'

ENV['DATABASE_URL'] = "sqlite3:#{database}"

class App < Rails::Application
  # Application configuration
  config.eager_load = true # Eager load all classes

  config.root = __dir__
  config.consider_all_requests_local = true
  config.secret_key_base = 'i_am_a_secret'
  config.active_storage.service_configurations = { 'local' => { 'service' => 'Disk', 'root' => './storage' } }

  # Logging configuration
  config.logger = Logger.new(STDOUT)
  config.log_level = :debug

  # View configuration
  config.to_prepare do
    ActionController::Base.prepend_view_path Rails.root.join(__dir__, 'views')
  end

  config.public_file_server.enabled = true # Serve static files from the /public directory

  # Routing configuration

  routes.append do
    root to: 'home#index'
    get '/something', to: 'other#something'
    get '/piece_by_piece', to: 'other#piece_by_piece'
    get '/llm', to: 'llm#index'
    get '/query', to: 'llm#query'
    get '/streaming_response', to: 'llm#streaming_response'
  end
end

App.initialize!

# Run App
Rack::Handler::Puma.run(App, Host: '127.0.0.1', Port: 3000, Verbose: true)

