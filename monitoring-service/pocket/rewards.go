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
	return float64(r.TotalProofs) * 0.0089
}
