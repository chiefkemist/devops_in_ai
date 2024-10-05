
require_relative './llm'

module Controllers
  class HomeController < ActionController::Base
    layout 'application'

    def index
      render "home/index"
    end
  end

  class LlmController < ActionController::Base
    include ActionController::Live
    include LLM::LlamaCpp
    def index
      render inline: 'LLM'
    end

    def query
      prompt = params[:prompt]
      render json: { stream_url: "/streaming_response?prompt=#{prompt}" }
    end

    def streaming_response
      return unless params[:prompt]

      response.headers['Content-Type'] = 'text/event-stream'
      sse = SSE.new(response.stream, retry: 300, event: 'llm-response')

      response_buffer = StringIO.new
      prompt = params[:prompt]

      begin
        client.streaming_query(
          [
            {'role': 'user', 'content': prompt},
            #{'role': 'user', 'content': 'Implement the Y Combinator in Ruby'},
          ], proc { |chunk, bytesize|
            logger.debug { "Chunk: #{chunk}" }
            logger.debug { "Bytesize: #{bytesize}" }
            partial_response = chunk.dig 'choices', 0, 'delta', 'content'
            response_buffer << partial_response
            #msg = { id: Time.now.to_f, text: response_buffer.string }
            #sse.write msg.to_json, event: 'llm-response', retry: 300 if partial_response
            sse.write response_buffer.string, event: 'message', id: Time.now.to_f, retry: 300 if partial_response
            #sleep 0.4
          })
      rescue => e
        logger.error { "STREAMING_ERROR:::: #{e}" }
        sse.write "Error: #{e}", event: 'llm-response', retry: 300
        sse.write error: e.message
        sse.close
      ensure
        sse.close
      end
      logger.info { "Final Response: #{response_buffer.string}" }
    end

    private

    def client
      @llm_client ||= AI.new
    end
  end
end
