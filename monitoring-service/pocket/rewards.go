package pocket

type MonthlyReward struct {
	Year                    uint
	Month                   uint
	TotalProofs             uint
	AvgSecsBetweenRewards   float64
	TotalSecsBetweenRewards float64
	DaysOfWeek              map[int]*DayOfWeek
	Transactions            []Transaction
}

type DayOfWeek struct {
	Name   string
	Proofs uint
}

func (r *MonthlyReward) PoktAmount() float64 {
	var total float64
	for _, t := range r.Transactions {
		if t.IsConfirmed {
			total += t.PoktAmount() * t.StakeWeight
		}
	}
	return total
}
