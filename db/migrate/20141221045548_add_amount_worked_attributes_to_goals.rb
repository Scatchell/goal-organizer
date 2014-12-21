class AddAmountWorkedAttributesToGoals < ActiveRecord::Migration
  def change
    add_column :goals, :worked_for_week, :integer
    add_column :goals, :total_amount_worked, :integer
  end
end
