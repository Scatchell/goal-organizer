class GoalsController < ApplicationController
  skip_before_filter :verify_authenticity_token

  def new
  end

  def update
    puts params
    render json: params[:goal]
  end
end
