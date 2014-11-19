class CreateGoals < ActiveRecord::Migration
  def change
    create_table :goals do |t|
      t.string :title
      t.integer :level

      t.timestamps
    end
  end
end
