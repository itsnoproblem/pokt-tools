package pocket

type MonthlyReward struct {
	Year         uint
	Month        uint
	TotalProofs  uint
	Transactions []Transaction
}

func (r *MonthlyReward) PoktAmount() float64 {
	return float64(r.TotalProofs) * 0.0089
}
