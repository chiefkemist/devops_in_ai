
require 'ruby/openai'

module LLM
  module Groq
    class AI
      def initialize
        @groq = OpenAI::Client::new(
          access_token: ENV.fetch('GROQ_API_KEY'),
          uri_base: ENV.fetch('GROQ_URI_BASE') { "https://api.groq.com/openai/v1" }
        ) do |f|
            f.response :logger, Logger::new($stdout), bodies: true
          end
      end
      def streaming_query(messages, proc)
        @groq.chat(
          parameters: {
            model: 'llama-3.2-90b-text-preview',
            messages: messages,
            stream: proc
          }
        )
      end
    end
  end
  module LlamaCpp
    class AI
      def initialize
        @ollama = OpenAI::Client::new(
          uri_base: ENV.fetch('LLAMACPP_URI_BASE') { "http://localhost:8080" }
        ) do |f|
            f.response :logger, Logger::new($stdout), bodies: true
          end
      end
      def streaming_query(messages, proc)
        @ollama.chat(
          parameters: {
            model: 'Llama-3.2-1B-Instruct-Q8_0-GGUF',
            messages: messages,
            stream: proc
          }
        )
      end
    end
  end
  module Ollama
    class AI
      def initialize
        @ollama = OpenAI::Client::new(
          uri_base: ENV.fetch('OLLAMA_URI_BASE') { "http://localhost:11434" }
        ) do |f|
            f.response :logger, Logger::new($stdout), bodies: true
          end
      end
      def streaming_query(messages, proc)
        @ollama.chat(
          parameters: {
            model: 'llama3.2',
            messages: messages,
            stream: proc
          }
        )
      end
    end
  end
end
