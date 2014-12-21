scheduler = Rufus::Scheduler.new
include GoalsHelper

scheduler.every('1d') do
  Rails.logger.info 'Aggregating all goals at: ' + Time.new.to_s

  GoalsHelper::aggregate_amount_worked_for_week

  Rails.logger.info 'Aggregation complete at: ' + Time.new.to_s
end