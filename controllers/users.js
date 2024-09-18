import User from "../models/User.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

//serach api
export const searchUsers=async(req,res)=>{
  try{
    const query=req.query.query;
    if(!query){
      res.status(400).json({message:"query Parameter is required"})
    }
    // const users=await User.find({
    //  firstName: { $regex: query, $options: 'i' },
   
    // })
    const searchTerms = query.split(' ');

    const users = await User.find({
      $or: [
        { firstName: { $regex: searchTerms[0], $options: 'i' } },
        { lastName: { $regex: searchTerms[0], $options: 'i' } },
        ...(searchTerms[1] ? [{ firstName: { $regex: searchTerms[1], $options: 'i' } }, { lastName: { $regex: searchTerms[1], $options: 'i' } }] : [])
      ]
    })
    res.status(200).json(users);
  }
  catch(err){
    console.log("user not found")
    res.status(500).json({message:"Internal Server Error"})
  }
}

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    //if the friend exist in the friendslist of user with a id
    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

